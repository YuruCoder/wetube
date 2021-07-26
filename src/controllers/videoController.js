// Global Router

export const trending = (req, res) => res.render("home", { pageTitle: "Home" });
export const search = (req, res) => res.send("Search Video");

// Video Router

export const upload = (req, res) => res.send("Upload Videos");

// Video ID Required

export const see = (req, res) =>
  res.render("watch", { pageTitle: "Watch Video" });

export const edit = (req, res) =>
  res.render("edit", { pageTitle: "Edit Video" });

export const deleteVideo = (req, res) => res.send("Delete Video");
