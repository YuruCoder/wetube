import mongoose from "mongoose";

try {
  mongoose.connect(String(process.env.DB_URL));
  console.log("✅ Connected to DB");
} catch (error) {
  console.log("❌ DB Error: ", error);
}
