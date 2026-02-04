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

/* 🔥 REQUIRED FOR RENDER */
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

/* ============================
   CORS (STRICT)
============================ */
app.use(
  cors({
    origin: FRONTEND_URL, // MUST be exact Vercel URL
    credentials: true,
  })
);
const isProd = process.env.NODE_ENV === "production";

app.use(express.json());

/* ============================
   SESSION (FINAL FIX)
============================ */

app.use(
  session({
    name: "louderworld.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,          // ✅ only true in production
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
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

app.get("/", (req, res) => {
  res.json({ status: "Server running 🚀" });
});

/* ============================
   START
============================ */
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Server running on ${PORT}`)
  );
});
