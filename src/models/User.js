import { hash } from "bcrypt";
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: String,
  location: String,
  avatarUrl: String,
  socialOnly: { type: Boolean, default: false },
});

userSchema.pre("save", async function () {
  this.password = await hash(this.password, 5);
});

const User = mongoose.model("User", userSchema);

export default User;
