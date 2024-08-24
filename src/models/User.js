import { hash } from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  location: { type: String },
  avatarUrl: { type: String },
  socialOnly: { type: Boolean, default: false },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 5);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
