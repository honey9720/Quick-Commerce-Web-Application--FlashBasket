import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import UserModel from "./models/user.model.js";

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminEmail = "admin@example.com";
    const existingAdmin = await UserModel.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("✅ Admin user already exists:", adminEmail);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const adminUser = new UserModel({
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      verify_email: true,
      status: "Active",
    });

    await adminUser.save();
    console.log("🎉 Admin user created successfully!");
    console.log("Email:", adminEmail);
    console.log("Password:", "Admin@123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
}

createAdmin();
