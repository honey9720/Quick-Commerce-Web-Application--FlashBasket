import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import jwt from "jsonwebtoken";

// 🟢 Register
import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔑 Generate Access Token
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.SECRET_KEY_ACCESS_TOKEN, {
    expiresIn: "15m",
  });
};

// 🔑 Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.SECRET_KEY_REFRESH_TOKEN, {
    expiresIn: "7d",
  });
};

// 🟢 Register
export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, Email, and Password are required",
        error: true,
        success: false,
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
        error: true,
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      error: false,
    });
  } catch (err) {
    console.error("🔥 RegisterController Error:", err);
    return res.status(500).json({
      message: err.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// 🟢 Login
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Provide email and password",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not registered",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        message: "Account inactive. Contact Admin.",
        error: true,
        success: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Incorrect password",
        error: true,
        success: false,
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in DB
    await UserModel.findByIdAndUpdate(user._id, { refresh_token: refreshToken });

    // Set secure cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true on Render
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.json({
      message: "Login successful",
      error: false,
      success: true,
      data: { accessToken, refreshToken },
    });
  } catch (err) {
    console.error("🔥 LoginController Error:", err);
    return res.status(500).json({
      message: err.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// 🟢 Refresh Token
export const refreshTokenController = async (req, res) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) {
      return res.status(401).json({
        message: "Refresh token missing",
        error: true,
        success: false,
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.SECRET_KEY_REFRESH_TOKEN);
    } catch {
      return res.status(403).json({
        message: "Invalid or expired refresh token",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(payload.id);
    if (!user || user.refresh_token !== token) {
      return res.status(403).json({
        message: "Token mismatch or user not found",
        error: true,
        success: false,
      });
    }

    const newAccessToken = generateAccessToken(user._id);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    };
    res.cookie("accessToken", newAccessToken, cookieOptions);

    return res.json({
      message: "New access token generated",
      success: true,
      error: false,
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    console.error("🔥 RefreshTokenController Error:", err);
    return res.status(500).json({
      message: err.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};


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

