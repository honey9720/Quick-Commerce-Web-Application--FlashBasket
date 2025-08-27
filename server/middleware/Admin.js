import UserModel from "../models/user.model.js";

export const admin = async (request, response, next) => {
  try {
    const userId = request.userId; // set by your auth middleware

    if (!userId) {
      return response.status(401).json({
        message: "Unauthorized: No user ID",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(userId).select("role");

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    if (user.role !== "ADMIN") {
      return response.status(403).json({
        message: "Access denied. Admins only.",
        error: true,
        success: false,
      });
    }

    // ✅ user is admin → continue
    next();

  } catch (error) {
    console.error("Admin middleware error:", error);
    return response.status(500).json({
      message: "Server error: Permission check failed",
      error: true,
      success: false,
    });
  }
};
