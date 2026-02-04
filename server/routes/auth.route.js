import express from "express";
import passport from "passport";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failed",
    session: true,
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

router.get("/failed", (req, res) => {
  res.status(401).json({ message: "Google auth failed" });
});

router.post("/logout", (req, res) => {
  req.logout(() => {
    res.clearCookie("louderworld.sid", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.json({ message: "Logged out" });
  });
});

router.get("/user", (req, res) => {
  if (!req.user) return res.status(401).json(null);
  res.json(req.user);
});

export default router;
