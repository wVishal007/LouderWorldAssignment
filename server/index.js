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
   BASIC CONFIG
   ============================ */
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

/* ============================
   TRUST PROXY (REQUIRED ON RENDER)
   ============================ */
app.set("trust proxy", 1);

/* ============================
   CORS (CRITICAL)
   ============================ */
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

/* ============================
   SESSION (PRODUCTION SAFE)
   ============================ */
app.use(
  session({
    name: "louderworld.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,        // ✅ REQUIRED (HTTPS)
      sameSite: "none",    // ✅ REQUIRED (cross-site)
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
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connection failed", err);
  });
