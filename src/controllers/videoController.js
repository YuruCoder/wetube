import Comment from "../models/Comment";
import User from "../models/User";
import Video from "../models/Video";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
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
    }).populate("owner");
  }

  res.render("search", { pageTitle: "Search", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");

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
    files: { video, thumb },
  } = req;

  try {
    const newVideo = await Video.create({
      title,
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
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
    req.flash("error", "Not authorized");
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

  const video = await Video.findById(id);

  if (video === null) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }

  if (String(video.owner) !== String(user._id)) {
    req.flash("error", "You are not the owner of the video");
    return res.status(403).redirect("/");
  }

  video.title = title;
  video.description = description;
  video.hashtags = Video.formatHashtags(hashtags);
  await video.save();

  req.flash("success", "Changes saved");
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

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);

  if (video === null) {
    return res.sendStatus(404);
  }

  video.meta.views += 1;
  await video.save();

  res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    params: { id },
    body: { text },
    session: { user },
  } = req;

  const video = await Video.findById(id);

  if (video === null) {
    return res.sendStatus(404);
  }

  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });

  video.comments.push(comment._id);
  await video.save();

  res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const {
    params: { id },
    session: { user },
  } = req;

  const comment = await Comment.findById(id);

  if (comment === null) {
    return res.end();
  }

  if (comment.owner.toString() !== user._id) {
    return res.end();
  }

  await Comment.findByIdAndDelete(id);

  res.sendStatus(200);
};
