import bcrypt from "bcryptjs";
import prisma from "../../prisma.js";
import jwt from "jsonwebtoken";

const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const registerService = async (payload) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (existingUser) {
    throw createServiceError("User already exists", 409);
  }

  const existingUsername = await prisma.profile.findUnique({
    where: {
      username: payload.username,
    },
  });
  if (existingUsername) {
    throw createServiceError("Username already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  return prisma.user.create({
    data: {
      email: payload.email,
      password: hashedPassword,
      profile: {
        create: {
          username: payload.username,
          avatarUrl: payload.avatarUrl,
        },
      },
    },
  });
};

export const loginService = async (payload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: {
      profile: true,
    },
  });

  if (!user) {
    throw createServiceError("Invalid credentials", 401);
  }
  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) {
    throw createServiceError("Invalid credentials", 401);
  }

  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_TTL ?? "1h",
    },
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_TTL ?? "7d",
    },
  );

  return { user, accessToken, refreshToken };
};

export const profileService = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      profile: true,
    },
  });
  if (!user) {
    throw createServiceError("User not found", 404);
  }
  return {
    id: user.id,
    username: user.profile.username,
    avatarUrl: user.profile.avatarUrl,
    email: user.email,
  };
};
