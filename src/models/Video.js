import mongoose from "mongoose";

const { Schema } = mongoose;

const videoSchema = new Schema({
  fileUrl: { type: String, required: true },
  title: { type: String, trim: true, required: true },
  description: { type: String, trim: true, maxLength: 200, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
});

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
