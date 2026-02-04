import mongoose from "mongoose";

const emailLeadSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true
    },

    consent: {
      type: Boolean,
      required: true
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    source: {
      type: String,
      default: "website"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("EmailLead", emailLeadSchema);
