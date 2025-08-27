import { Router } from 'express';
import auth from '../middleware/auth.js';
import { CashOnDeliveryOrderController, getOrderDetailsController } from '../controllers/order.controller.js';

const orderRouter = Router();

// Cash on Delivery Order
orderRouter.post("/cash-on-delivery", auth, CashOnDeliveryOrderController);

// Get User Orders
orderRouter.get("/order-list", auth, getOrderDetailsController);

export default orderRouter;
