import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
import { Controller } from "./Icontroller";

// Root Controllers

export const getJoin: Controller = (req, res) => {
  return res.render("join", { pageTitle: "Join" });
};

export const postJoin: Controller = async (req, res) => {
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
  } catch (error: any) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: error._message,
    });
  }

  return res.redirect("/login");
};

export const getLogin: Controller = (req, res) => {
  return res.render("login", { pageTitle: "Log in" });
};

export const postLogin: Controller = async (req, res) => {
  const pageTitle = "Log in";
  const { username, password } = req.body;

  // Check Username
  const user = await User.findOne({ username, socialOnly: false });
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

  // Login
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

// Public User Controllers

export const logout: Controller = (req, res) => {
  req.session.destroy(() => console.log("Logged out"));
  return res.redirect("/");
};

export const getEdit: Controller = (req, res) => {
  return res.render("users/edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit: Controller = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );

  req.session.user = updatedUser;
  return res.redirect("/users/edit");
};

export const getChangePassword: Controller = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword: Controller = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user: any = await User.findById(_id);

  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }

  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "New password confirmation does not match.",
    });
  }

  user.password = newPassword;
  await user.save();
  return res.redirect("/");
};

export const remove: Controller = (req, res) => {
  return res.send("Remove User");
};

export const startGithubLogin: Controller = (req, res) => {
  // Send user to Github login page
  const baseURL = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: String(process.env.GH_CLIENT),
    allow_signup: "false",
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config);
  const finalURL = `${baseURL}?${params}`;
  return res.redirect(finalURL);
};

export const finishGithubLogin: Controller = async (req, res) => {
  // Use Github OAuth API and get TOKEN
  const baseURL = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: String(process.env.GH_CLIENT),
    client_secret: String(process.env.GH_SECRET),
    code: String(req.query.code),
  };
  const params = new URLSearchParams(config).toString();
  const finalURL = `${baseURL}?${params}`;
  const tokenRequest = await (
    await fetch(finalURL, {
      method: "POST",
      headers: { Accept: "application/json" },
    })
  ).json();

  // Github login if TOKEN Exist
  if ("access_token" in tokenRequest) {
    // Check Token exist and get data from github account
    const { access_token } = tokenRequest;
    const apiURL = "https://api.github.com";
    const userData = await (
      await fetch(`${apiURL}/user`, {
        headers: { Authorization: `token ${access_token}` },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiURL}/user/emails`, {
        headers: { Authorization: `token ${access_token}` },
      })
    ).json();
    const emailObj = emailData.find(
      (email: any) => email.primary === true && email.verified === true
    );

    // Check Error
    if (!emailObj) {
      return res.redirect("/login");
    }

    // Access DB and Find or Create Account
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }

    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

// Personal User Controllers

export const see: Controller = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos");

  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found" });
  }

  return res.render("users/profile", {
    pageTitle: user.name,
    user,
  });
};
