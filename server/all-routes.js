

// ===============================
// FILE: auth.route.js
// ===============================

import express from "express";
import passport from "passport";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

router.post("/logout", (req, res) => {
  req.logout(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

router.get("/user", (req, res) => {
  if (!req.user) return res.status(401).json(null);
  res.json(req.user);
});

export default router;


// ===============================
// FILE: events.route.js
// ===============================

import express from "express";
import Event from "../models/event.model.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

/* ===============================
   🌍 PUBLIC EVENTS
================================ */
router.get("/", async (req, res) => {
  try {
    const { city, search } = req.query;

    let query = {
      status: { $ne: "inactive" },
      dateTime: { $gte: new Date() },
    };

    if (city) query.city = city;

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { venueName: new RegExp(search, "i") },
      ];
    }

    const events = await Event.find(query).sort({ dateTime: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

/* ===============================
   🔐 DASHBOARD EVENTS
================================ */
router.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const { city, status, search } = req.query;
    let query = {};

    if (city) query.city = city;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { venueName: new RegExp(search, "i") },
      ];
    }

    const events = await Event.find(query)
      .sort({ updatedAt: -1 })
      .limit(200);

    res.json(events);
  } catch {
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
});

/* ===============================
   📥 IMPORT EVENT
================================ */
router.post("/:id/import", isAuthenticated, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.status = "imported";
    event.importedAt = new Date();
    event.importedBy = req.user._id;
    event.importNotes = req.body.importNotes || "";

    await event.save();
    res.json(event);
  } catch {
    res.status(500).json({ message: "Import failed" });
  }
});

/* ===============================
   🕷 SCRAPER
================================ */
router.post("/create", async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastScrapedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;


// ===============================
// FILE: leads.route.js
// ===============================

import express from "express";
import EmailLead from "../models/emailLead.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, consent, eventId } = req.body;

    if (!consent) {
      return res.status(400).json({ message: "Consent required" });
    }

    await EmailLead.create({ email, consent, eventId });

    res.status(201).json({ message: "Lead saved" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Failed to save lead" });
  }
});

export default router;
