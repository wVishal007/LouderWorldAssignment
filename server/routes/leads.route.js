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
