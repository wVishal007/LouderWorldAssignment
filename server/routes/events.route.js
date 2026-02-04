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

    // ✅ Fix timezone issue – start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = {
      status: { $ne: "inactive" }, // exclude inactive
      dateTime: { $gte: today },   // today + future
    };

    // ✅ City filter (case-insensitive, space-safe)
    if (city && city.trim() !== "") {
      query.city = {
        $regex: `^${city.trim()}$`,
        $options: "i",
      };
    }

    // ✅ Search filter
    if (search && search.trim() !== "") {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { venueName: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const events = await Event.find(query)
      .sort({ dateTime: 1 }) // earliest first
      .lean();

    res.status(200).json(events);
  } catch (error) {
    console.error("Fetch events error:", error);
    res.status(500).json({
      message: "Failed to fetch events",
    });
  }
});

/* ===============================
   🔐 DASHBOARD EVENTS
================================ */
router.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const { city, status, search, startDate, endDate } = req.query;
    let query = {};

    if (city) query.city = city;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.dateTime = {};
      if (startDate) query.dateTime.$gte = new Date(startDate);
      if (endDate) query.dateTime.$lte = new Date(endDate);
    }

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
   📥 IMPORT ALL EVENT
================================ */

router.get("/all", isAuthenticated, async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;

  const events = await Event.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Event.countDocuments();

  res.json({
    events,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    },
  });
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

router.get("/search", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, city } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: { $ne: "inactive" }, dateTime: { $gte: new Date() } };
    if (city) query.city = city;

    const events = await Event.find(query)
      .or(search ? [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { venueName: new RegExp(search, "i") }
      ] : [])
      .sort({ dateTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({
      events,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch {
    res.status(500).json({ message: "Search failed" });
  }
});

// Add to events.route.js
router.put("/:id/inactive", isAuthenticated, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch {
    res.status(500).json({ message: "Failed to mark as inactive" });
  }
});

// Add to events.route.js
router.post("/bulk-status", isAuthenticated, async (req, res) => {
  try {
    const { eventIds, status } = req.body;
    
    if (!["new", "updated", "inactive", "imported"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await Event.updateMany(
      { _id: { $in: eventIds } },
      { 
        status,
        ...(status === "imported" && {
          importedAt: new Date(),
          importedBy: req.user._id
        })
      }
    );

    res.json({ modifiedCount: result.modifiedCount });
  } catch {
    res.status(500).json({ message: "Bulk update failed" });
  }
});

// Add to events.route.js
router.get("/stats/overview", isAuthenticated, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: { $ne: "inactive" } });
    const newEvents = await Event.countDocuments({ status: "new" });
    const importedEvents = await Event.countDocuments({ status: "imported" });
    const inactiveEvents = await Event.countDocuments({ status: "inactive" });

    // Events by category
    const categoryStats = await Event.aggregate([
      { $match: { status: { $ne: "inactive" } } },
      { $unwind: "$category" },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Events by source
    const sourceStats = await Event.aggregate([
      { $group: { _id: "$sourceName", count: { $sum: 1 } } }
    ]);

    res.json({
      totals: {
        total: totalEvents,
        active: activeEvents,
        new: newEvents,
        imported: importedEvents,
        inactive: inactiveEvents
      },
      categories: categoryStats,
      sources: sourceStats
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// Add to events.route.js
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch {
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

// Add to events.route.js
router.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const { city, status, search, startDate, endDate } = req.query;
    let query = {};

    if (city) query.city = city;
    if (status) query.status = status;

    // 🔥 ADD DATE RANGE FILTER
    if (startDate || endDate) {
      query.dateTime = {};
      if (startDate) query.dateTime.$gte = new Date(startDate);
      if (endDate) query.dateTime.$lte = new Date(endDate);
    }

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

export default router;
