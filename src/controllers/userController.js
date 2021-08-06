import User from "../models/User";
import bcrypt from "bcrypt";

// Root Controllers

export const getJoin = (req, res) => {
  return res.render("join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
  const pageTitle = "Join";
  const { name, email, username, password, password2, location } = req.body;
  // Error Check
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (password !== password2) {
    return res.render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  } else if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }
  // Create Account
  try {
    await User.create({
      name,
      email,
      username,
      password,
      location,
    });
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: error._message,
    });
  }
  return res.redirect("/login");
};

export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "Log in" });
};

export const postLogin = async (req, res) => {
  const pageTitle = "Log in";
  const { username, password } = req.body;
  // Check Username
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }
  // Check Password
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  return res.redirect("/");
};

// Public User Controllers

export const logout = (req, res) => res.send("Log out");

export const edit = (req, res) => res.send("Edit User");

export const remove = (req, res) => res.send("Remove User");

// Personal User Controllers

export const see = (req, res) => res.send("See User");
