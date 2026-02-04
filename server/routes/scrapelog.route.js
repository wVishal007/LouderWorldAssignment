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