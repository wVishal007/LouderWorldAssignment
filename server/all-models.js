

// ===============================
// FILE: emailLead.model.js
// ===============================

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


// ===============================
// FILE: event.model.js
// ===============================

import mongoose from "mongoose";
import crypto from "crypto";

const eventSchema = new mongoose.Schema(
  {
    /* =========================
       CORE EVENT INFO
    ========================= */
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    shortSummary: {
      type: String,
      default: "",
    },

    /* =========================
       DATE & TIME
    ========================= */
    dateTime: {
      type: Date,
      required: true,
      index: true,
    },
    endDateTime: {
      type: Date,
    },

    /* =========================
       VENUE
    ========================= */
    venueName: {
      type: String,
      default: "",
    },
    venueAddress: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "Sydney",
      index: true,
    },

    /* =========================
       CATEGORIZATION
    ========================= */
    category: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },

    /* =========================
       MEDIA
    ========================= */
    imageUrl: {
      type: String,
      default: "",
    },

    /* =========================
       SOURCE INFO (SCRAPER)
    ========================= */
    sourceName: {
      type: String,
      required: true,
      index: true,
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    sourceEventId: {
      type: String,
      default: "",
    },

    /* =========================
       DEDUPLICATION HASH
    ========================= */
    eventHash: {
      type: String,
      unique: true,
      index: true,
    },

    /* =========================
       STATUS PIPELINE
    ========================= */
    status: {
      type: String,
      enum: ["new", "updated", "inactive", "imported"],
      default: "new",
      index: true,
    },
    lastScrapedAt: {
      type: Date,
      default: Date.now,
    },

    /* =========================
       DASHBOARD IMPORT INFO
    ========================= */
    importedAt: {
      type: Date,
    },
    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    importNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/* ==================================================
   🔍 TEXT SEARCH INDEX
================================================== */
eventSchema.index({
  title: "text",
  description: "text",
  venueName: "text",
});

/* ==================================================
   🔐 AUTO-GENERATE EVENT HASH
================================================== */
eventSchema.pre("validate", function () {
  if (!this.eventHash) {
    const raw = `${this.sourceName}_${this.sourceEventId || ""}_${this.dateTime}`;
    this.eventHash = crypto.createHash("sha256").update(raw).digest("hex");
  }
});


/* ==================================================
   🔄 AUTO STATUS UPDATE ON CHANGE
================================================== */
eventSchema.pre("save", function () {
  if (!this.isNew && this.isModified(["title", "description", "dateTime", "venueName"])) {
    if (this.status !== "imported") this.status = "updated";
  }

  // Default endDateTime
  if (!this.endDateTime) this.endDateTime = this.dateTime;
});


/* ==================================================
   🔗 COMPOUND INDEX FOR DASHBOARD FILTERS
================================================== */
eventSchema.index({ city: 1, status: 1, dateTime: 1 });

export default mongoose.model("Event", eventSchema);


// ===============================
// FILE: scrapeLog.model.js
// ===============================

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


// ===============================
// FILE: user.model.js
// ===============================

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true
    },

    name: String,
    email: {
      type: String,
      required: true
    },

    avatar: String,

    role: {
      type: String,
      default: "admin"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);
