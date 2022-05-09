import mongoose from "mongoose";

const main = async () => {
  try {
    mongoose.connect(JSON.stringify(process.env.DB_URL));
    console.log("✅ Connected to DB");
  } catch (error) {
    console.log("❌ DB Error: ", error);
  }
};

main();
