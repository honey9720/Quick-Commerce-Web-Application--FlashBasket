import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";

import connectDB from "./config/connectDB.js";
import userRouter from "./route/user.route.js";
import categoryRouter from "./route/category.route.js";
import uploadRouter from "./route/upload.router.js";
import subCategoryRouter from "./route/subCategory.route.js";
import productRouter from "./route/product.route.js";
import cartRouter from "./route/cart.route.js";
import addressRouter from "./route/address.route.js";
import orderRouter from "./route/order.route.js";

const app = express();

// ✅ Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://quick-commerce-web-application-wir1.onrender.com"
];

// ✅ Proper CORS setup
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

// ✅ Static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Routes
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Server is running on port " + (process.env.PORT || 8080)
  });
});
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/file", uploadRouter);
app.use("/api/subcategory", subCategoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

// ✅ Error handler (catches errors & logs them)
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

// ✅ Correct PORT fallback (must be number)
const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("✅ Server is running on port", PORT);
  });
});
