import mongoose from "mongoose";

const { Schema } = mongoose;

interface IVideo {
  path: string;
  title: string;
  description: string;
  createdAt: Date;
  hashtags: string[];
  meta: {
    views: number;
    rating: number;
  };
  owner: mongoose.Schema.Types.ObjectId;
}

interface IVideoModel extends mongoose.Model<IVideo> {
  formatHashtags(hashtags: string): string[];
}

const videoSchema = new Schema<IVideo, IVideoModel>({
  path: { type: String, required: true },
  title: { type: String, trim: true, required: true },
  description: { type: String, trim: true, maxLength: 200, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

videoSchema.static("formatHashtags", (hashtags: string) => {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model<IVideo, IVideoModel>("Video", videoSchema);

export default Video;
