import { ZodError } from "zod";
import { registerSchema } from "../../validators/auth/auth.js";
import { registerService } from "../../services/auth/auth.js";
import { loginService } from "../../services/auth/auth.js";
import { loginSchema } from "../../validators/auth/auth.js";
import { profileService } from "../../services/auth/auth.js";
import jwt from "jsonwebtoken";
import prisma from "../../prisma.js";

export const registerController = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const newUser = await registerService(validatedData);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser.id,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues,
      });
    }

    const statusCode = error.statusCode ?? 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message ?? "Internal server error",
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } =
      await loginService(validatedData);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    });
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: user.id,
      accessToken,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues,
      });
    }

    const statusCode = error.statusCode ?? 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message ?? "Internal server error",
    });
  }
};

export const meController = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const profile = await profileService(payload.userId);

    return res.status(200).json(profile);
  } catch (error) {
    const statusCode = error.statusCode ?? 401;
    return res.status(statusCode).json({
      success: false,
      message: error.message ?? "Unauthorized",
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await prisma.refreshToken.delete({
        where: {
          token: refreshToken,
        },
      });
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    const statusCode = error.statusCode ?? 500;
    return res
      .status(statusCode)
      .json({ success: false, message: "Internal server error" });
  }
};

export const refreshController = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_TTL ?? "1h" },
    );
    return res
      .status(200)
      .json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    const statusCode = error.statusCode ?? 401;
    return res.status(statusCode).json({
      success: false,
      message: error.message ?? "Unauthorized",
    });
  }
};
