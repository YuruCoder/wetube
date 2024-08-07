import { hash } from "bcrypt";
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  loaction: String,
});

userSchema.pre("save", async function () {
  this.password = await hash(this.password, 5);
});

const User = mongoose.model("User", userSchema);

export default User;
