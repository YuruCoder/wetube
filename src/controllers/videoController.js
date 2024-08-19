import User from "../models/User";
import Video from "../models/Video";

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ createdAt: "desc" });
  res.render("home", { pageTitle: "Home", videos });
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];

  if (keyword !== undefined) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    });
  }

  res.render("search", { pageTitle: "Search", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner");

  if (video === null) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }

  res.render("videos/watch", { pageTitle: video.title, video });
};

export const getUpload = (req, res) => {
  res.render("videos/upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    body: { title, description, hashtags },
    session: { user: _id },
    file: { path: fileUrl },
  } = req;

  try {
    const newVideo = await Video.create({
      title,
      fileUrl,
      description,
      hashtags: Video.formatHashtags(hashtags),
      owner: _id,
    });

    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();

    res.redirect("/");
  } catch (error) {
    res.status(400).render("videos/upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const getEdit = async (req, res) => {
  const {
    params: { id },
    session: { user },
  } = req;
  const video = await Video.findById(id);

  if (video === null) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }

  if (video.owner.toString() !== user._id) {
    return res.status(403).redirect("/");
  }

  res.render("videos/edit", { pageTitle: `Edit: ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const {
    params: { id },
    body: { title, description, hashtags },
    session: { user },
  } = req;
  const video = await Video.exists({ _id: id });

  if (video === null) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }

  if (video.owner.toString() !== user._id) {
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });

  res.redirect(`/videos/${id}`);
};

export const deleteVideo = async (req, res) => {
  const {
    params: { id },
    session: { user },
  } = req;

  const video = await Video.findById(id);

  if (video === null) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }

  if (video.owner.toString() !== user._id) {
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndDelete(id);
  res.redirect("/");
};
