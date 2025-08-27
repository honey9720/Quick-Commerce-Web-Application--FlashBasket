import express from "express";
import { auth } from "../middleware/auth.js";
import { admin } from "../middleware/Admin.js";
import UserModel from "../models/user.model.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";

const router = express.Router();

/**
 * @route   GET /api/admin/dashboard
 * @desc    Admin Dashboard Overview
 * @access  Private/Admin
 */
router.get("/dashboard", auth, admin, async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalProducts = await productModel.countDocuments();
    const totalOrders = await orderModel.countDocuments();

    res.json({
      success: true,
      message: "Admin Dashboard Data",
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get("/users", auth, admin, async (req, res) => {
  try {
    const users = await UserModel.find().select("-password -refresh_token");
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: true, message: error.message });
  }
});

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders
 * @access  Private/Admin
 */
router.get("/orders", auth, admin, async (req, res) => {
  try {
    const orders = await orderModel.find().populate("user").populate("products");
    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: true, message: error.message });
  }
});

/**
 * @route   DELETE /api/admin/user/:id
 * @desc    Delete a user
 * @access  Private/Admin
 */
router.delete("/user/:id", auth, admin, async (req, res) => {
  try {
    await UserModel.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: true, message: error.message });
  }
});

export default router;
