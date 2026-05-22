import prisma from "../../prisma.js";

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const { userId } = req.user;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const avatar = `${process.env.API_URL}/uploads/${req.file.filename}`;
    await prisma.profile.update({
      where: { userId },
      data: { avatarUrl: avatar },
    });
    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      avatarUrl: avatar,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
