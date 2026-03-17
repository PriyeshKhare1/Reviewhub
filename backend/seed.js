import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Review from "./models/Review.js";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Review.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // 👑 Create ADMIN user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@reviewhub.com",
      password: adminPassword,
      isVerified: true,
      role: "admin",
    });
    console.log("👑 Created ADMIN user - Email: admin@reviewhub.com, Password: admin123");

    // Create a demo user
    const demoPassword = await bcrypt.hash("demo123", 10);
    const demoUser = await User.create({
      name: "John Reviewer",
      email: "demo@reviewhub.com",
      password: demoPassword,
      isVerified: true,
      role: "user",
    });
    console.log("✅ Created demo user - Email: demo@reviewhub.com, Password: demo123");

    // Create demo reviews
    const reviews = [
      {
        title: "Amazing Laptop - Best Purchase Ever!",
        description:
          "This laptop has completely changed my productivity. The performance is incredible, battery lasts all day, and the build quality is premium.",
        rating: 5,
        category: "Tech",
        user: demoUser._id,
        isAnonymous: false,
      },
      {
        title: "Great Movie - Highly Recommended",
        description:
          "One of the best films I've watched in years. The cinematography, acting, and plot were all exceptional.",
        rating: 5,
        category: "Movies",
        user: demoUser._id,
        isAnonymous: false,
      },
      {
        title: "Must Read Book - Page Turner",
        description:
          "Couldn't put this book down! The story kept me engaged throughout, with amazing character development.",
        rating: 4,
        category: "Books",
        user: demoUser._id,
        isAnonymous: false,
      },
      {
        title: "Delicious Restaurant Experience",
        description:
          "The food was fresh, delicious, and beautifully presented. Great ambiance and excellent service. Would definitely come back!",
        rating: 5,
        category: "Food",
        user: demoUser._id,
        isAnonymous: false,
      },
      {
        title: "Dream Vacation to Paradise",
        description:
          "Had an unforgettable experience. Beautiful beaches, friendly locals, and amazing weather. Worth every penny!",
        rating: 5,
        category: "Travel",
        user: demoUser._id,
        isAnonymous: false,
      },
      {
        title: "Good But Could Be Better",
        description:
          "Overall decent product, but there are some minor issues. For the price, I'd expect a bit more quality.",
        rating: 3,
        category: "Tech",
        user: demoUser._id,
        isAnonymous: true,
      },
    ];

    await Review.insertMany(reviews);
    console.log("✅ Created 6 demo reviews");

    console.log("\n🎉 Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();
