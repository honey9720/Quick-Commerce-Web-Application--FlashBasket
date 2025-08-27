import CartProductModel from '../models/cartproduct.model.js';
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

// Handle Cash on Delivery Orders
export async function CashOnDeliveryOrderController(request, response) {
  try {
    const userId = request.userId; // from auth middleware
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    const payload = list_items.map(el => ({
      userId: userId,
      orderId: `ORD-${new mongoose.Types.ObjectId()}`,
      productId: el.productId._id,
      product_details: {
        name: el.productId.name,
        image: el.productId.image
      },
      paymentId: "",
      payment_status: "CASH ON DELIVERY",
      delivery_address: addressId,
      subTotalAmt: subTotalAmt,
      totalAmt: totalAmt,
    }));

    const generatedOrder = await OrderModel.insertMany(payload);

    // Remove items from cart
    await CartProductModel.deleteMany({ userId: userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

    return response.json({
      message: "Order successfully placed",
      error: false,
      success: true,
      data: generatedOrder
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

// Get Order Details for User
export async function getOrderDetailsController(request, response) {
  try {
    const userId = request.userId;

    const orderlist = await OrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .populate('delivery_address');

    return response.json({
      message: "Order list",
      data: orderlist,
      error: false,
      success: true
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

// Optional: helper to calculate discounted price
export const pricewithDiscount = (price, dis = 1) => {
  const discountAmount = Math.ceil((Number(price) * Number(dis)) / 100);
  return Number(price) - discountAmount;
};
