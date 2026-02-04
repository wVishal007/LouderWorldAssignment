import "dotenv/config";
import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";

import "./config/passport.js";
import connectDB from "./config/db.js";

import eventsRoutes from "./routes/events.route.js";
import leadsRoutes from "./routes/leads.route.js";
import authRoutes from "./routes/auth.route.js";

const app = express();

/* ============================
   ENV & PORT
   ============================ */
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

/* ============================
   MIDDLEWARES
   ============================ */

// 🔥 CORS (VERY IMPORTANT for sessions)
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

/* ============================
   SESSION CONFIG
   ============================ */
app.use(
  session({
    name: "louderworld.sid",
    secret: process.env.SESSION_SECRET || "event-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true only on HTTPS (Render / Prod)
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

/* ============================
   PASSPORT
   ============================ */
app.use(passport.initialize());
app.use(passport.session());

/* ============================
   ROUTES
   ============================ */
app.use("/api/events", eventsRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/auth", authRoutes);

/* ============================
   HEALTH CHECK
   ============================ */
app.get("/", (req, res) => {
  res.json({ status: "Server running 🚀" });
});

/* ============================
   START SERVER
   ============================ */
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed", err);
  });
