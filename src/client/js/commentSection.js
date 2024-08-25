const videoContainer = document.getElementById("videoContainer"),
  form = document.getElementById("commentForm"),
  deleteBtns = document.getElementsByClassName("deleteBtn");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = " " + text;
  const span2 = document.createElement("span");
  span2.innerText = " ❌";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;

  if (text === "") {
    return;
  }

  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

const handleDeleteComment = async (event) => {
  const element = event.target.parentElement;
  const id = element.dataset.id;
  console.log(id);

  if (window.confirm("Do you really want to delete this comment?")) {
    await fetch(`/api/videos/${id}/comment`, { method: "DELETE" });
    element.remove();
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
if (deleteBtns) {
  for (let i = 0; i < deleteBtns.length; i++) {
    deleteBtns.item(i).addEventListener("click", handleDeleteComment);
  }
}
