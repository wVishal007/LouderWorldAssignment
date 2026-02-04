import mongoose from "mongoose";

const scrapeLogSchema = new mongoose.Schema(
  {
    sourceName: String,
    city: String,

    totalFetched: Number,
    newEvents: Number,
    updatedEvents: Number,
    inactiveEvents: Number,

    startedAt: Date,
    finishedAt: Date,

    status: {
      type: String,
      enum: ["success", "failed"]
    },

    errorMessage: String
  },
  {
    timestamps: true
  }
);

export default mongoose.model("ScrapeLog", scrapeLogSchema);
