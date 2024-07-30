import Video from "../models/Video";

export const home = async (req, res) => {
  const videos = await Video.find({});
  res.render("home", { pageTitle: "Home", videos });
};

export const watch = (req, res) => {
  const { id } = req.params;
  res.render("watch", { pageTitle: "Watching" });
};

export const getEdit = (req, res) => {
  res.render("edit", { pageTitle: "Editing" });
};

export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = (req, res) => {
  const { title } = req.body;
  res.redirect("/");
};
