import prisma from "../../prisma.js";

export const addFavorite = async (req, res, next) => {
  try {
    const user = req.user.userId;
    const { movieId } = req.body;
    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "Movie ID is required",
      });
    }
    const favorite = await prisma.favorite.create({
      data: {
        movieId,
        userId: user,
      },
    });
    res.status(201).json({
      success: true,
      message: "Favorite added successfully",
      favorite,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Movie already in favorites",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to add favorite",
      error: error.message,
    });
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const user = req.user.userId;
    const { movieId } = req.body;
    if (!movieId) {
      throw new Error("Movie ID is required");
    }
    const favorite = await prisma.favorite.delete({
      where: { userId_movieId: { userId: user, movieId } },
    });
    res.status(200).json({
      success: true,
      message: "Favorite removed successfully",
      favorite,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to remove favorite",
      error: error.message,
    });
    next(error);
  }
};

export const getFavorites = async (req, res, next) => {
  try {
    const user = req.user.userId;
    const favorite = await prisma.favorite.findMany({
      where: { userId: user },
    });
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Favorite found successfully",
      favorite,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to get favorites",
      error: error.message,
    });
    next(error);
  }
};
