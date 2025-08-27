import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import jwt from "jsonwebtoken";

// 🟢 Register
export async function registerController(request, response) {
  try {
    const { name, email, password } = request.body;

    if (!name || !email || !password) {
      return response.status(400).json({
        message: "Name, Email, and Password are required",
        error: true,
        success: false,
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return response.status(400).json({
        message: "User already registered",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const newUser = new UserModel({
      name,
      email,
      password: hashPassword,
    });

    await newUser.save();

    return response.json({
      message: "User registered successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("🔥 RegisterController error:", error);
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// 🟢 Login
export async function loginController(request, response) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        message: "Provide email and password",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(400).json({
        message: "User not registered",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return response.status(400).json({
        message: "Contact Admin - account not active",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
      return response.status(400).json({
        message: "Incorrect password",
        error: true,
        success: false,
      });
    }

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    await UserModel.findByIdAndUpdate(user._id, {
      last_login_date: new Date(),
      refresh_token: refreshToken,
    });

    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    };

    response.cookie("accessToken", accessToken, cookiesOption);
    response.cookie("refreshToken", refreshToken, cookiesOption);

    return response.json({
      message: "Login successfully",
      error: false,
      success: true,
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error("🔥 LoginController error:", error);
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// 🟢 Refresh Token
export async function refreshTokenController(request, response) {
  try {
    const refreshToken =
      request.cookies.refreshToken || request.body.refreshToken;

    if (!refreshToken) {
      return response.status(401).json({
        message: "Refresh token not provided",
        error: true,
        success: false,
      });
    }

    let verifyToken;
    try {
      verifyToken = jwt.verify(
        refreshToken,
        process.env.SECRET_KEY_REFRESH_TOKEN
      );
    } catch (err) {
      return response.status(403).json({
        message: "Invalid or expired refresh token",
        error: true,
        success: false,
      });
    }

    const userId = verifyToken?.id;
    const newAccessToken = await generatedAccessToken(userId);

    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    };

    response.cookie("accessToken", newAccessToken, cookiesOption);

    return response.json({
      message: "New access token generated",
      error: false,
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    console.error("🔥 RefreshTokenController error:", error);
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// 🟢 Logout
export async function logoutController(request, response) {
  try {
    response.clearCookie("accessToken");
    response.clearCookie("refreshToken");

    return response.json({
      message: "Logout successful",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// 🟢 User Details
export async function userDetails(request, response) {
  try {
    const userId = request.userId; // set from auth middleware
    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "User details fetched",
      error: false,
      success: true,
      data: user,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// 🟢 Update User
export async function updateUserDetails(request, response) {
  try {
    const userId = request.userId;
    const updateData = request.body;

    await UserModel.findByIdAndUpdate(userId, updateData);

    return response.json({
      message: "User details updated",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// 🟢 Forgot Password
export async function forgotPasswordController(request, response) {
  try {
    // here you’d send OTP/email but I’ll keep simple
    return response.json({
      message: "Password reset link/OTP sent",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// 🟢 Reset Password
export async function resetPassword(request, response) {
  try {
    const { email, newPassword } = request.body;
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    await UserModel.findOneAndUpdate({ email }, { password: hashPassword });

    return response.json({
      message: "Password reset successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// 🟢 Dummy Verify Email
export async function verifyEmailController(request, response) {
  return response.json({
    message: "Email verified (dummy response)",
    error: false,
    success: true,
  });
}
// 🟢 Upload Avatar
export async function uploadAvatar(request, response) {
  try {
    const userId = request.userId;
    const file = request.file;

    if (!file) {
      return response.status(400).json({
        message: "No avatar uploaded",
        error: true,
        success: false,
      });
    }

    // Store the path relative to your server root
    const avatarPath = `/uploads/avatars/${file.filename}`;

    await UserModel.findByIdAndUpdate(userId, { avatar: avatarPath });

    return response.json({
      message: "Avatar uploaded successfully",
      error: false,
      success: true,
      data: { avatar: avatarPath },
    });
  } catch (error) {
    console.error("🔥 UploadAvatar error:", error);
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}
// 🟢 Dummy Verify Forgot Password OTP
export async function verifyForgotPasswordOtp(request, response) {
  return response.json({
    message: "OTP verified (dummy response)",
    error: false,
    success: true,
  });
}
