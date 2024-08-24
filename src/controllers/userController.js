import { compare } from "bcrypt";
import User from "../models/User";

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";

  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }

  const exists = await User.exists({ $or: [{ username }, { email }] });

  if (exists !== null) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }

  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });

    res.redirect("/login");
  } catch (error) {
    res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) => {
  res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });

  if (user === null) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }

  const ok = await compare(password, user.password);

  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }

  /**
   * 회원 인증 과정 (세션 DB를 간단하게 사용할 수 있는 이유)
   * 1. Request를 받은 서버는 자동으로 브라우저에 쿠키를 전송함
   * 2. 쿠키를 받은 브라우저는 Request를 보낼 때 자동으로 쿠키를 포함함
   * 3. 백엔드는 SessionDB에 접속할 수 있도록 SessionID (connect.sid) 를 쿠키에 할당함
   * 4. SessionID 할당과 동시에 SessionDB에는 해당 ID를 키로 한 DB가 생겨남
   * 5. 재접속 시 백엔드는 브라우저가 보낸 ID가 DB에 저장되어 있는지 확인 후 Response 를 결정
   */

  req.session.loggedIn = true;
  req.session.user = user;

  res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  res.redirect(`${baseUrl}?${params}`);
};

export const finishGithubLogin = async (req, res) => {
  // Get access token from Github API

  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  const tokenData = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if (!Object.hasOwn(tokenData, "access_token")) {
    return res.redirect("/login");
  }

  // Get data from Github

  const { access_token } = tokenData;
  const apiUrl = "https://api.github.com";

  const userData = await (
    await fetch(`${apiUrl}/user`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
  ).json();

  const emailData = await (
    await fetch(`${apiUrl}/user/emails`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
  ).json();

  // Check existing user with email and log in

  const emailObj = emailData.find(
    (email) => email.primary === true && email.verified === true,
  );

  if (emailObj === undefined) {
    return res.redirect("/login");
  }

  let user = await User.findOne({ email: emailObj.email });

  if (user === null) {
    user = await User.create({
      name: userData.name,
      username: userData.login,
      email: emailObj.email,
      password: "",
      location: userData.location,
      avatarUrl: userData.avatar_url,
      socialOnly: true,
    });
  }

  req.session.loggedIn = true;
  req.session.user = user;

  res.redirect("/");
};

export const logout = (req, res) => {
  req.session.user = null;
  req.session.loggedIn = false;
  res.locals.loggedInUser = req.session.user;
  req.flash("info", "Bye Bye");
  res.redirect("/");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });

  if (user === null) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }

  res.render("users/profile", { pageTitle: user.name, user });
};

export const getEdit = (req, res) => {
  res.render("users/edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    body: { name, email, username, location },
    session: {
      user: { _id, avatarUrl },
    },
    file,
  } = req;

  req.session.user = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
    },
    {
      new: true,
    },
  );

  res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Can't change password");
    return res.redirect("/");
  }
  res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    body: { oldPassword, newPassword, newPasswordConfirm },
    session: {
      user: { _id, password },
    },
  } = req;

  const ok = await compare(oldPassword, password);

  if (!ok) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }

  if (newPassword !== newPasswordConfirm) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation",
    });
  }

  const user = await User.findById(_id);
  user.password = newPassword;
  await user.save();

  req.session.user.password = user.password;

  req.flash("info", "Password updated");
  res.redirect("/users/logout");
};
