const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/userController");

// استدعاء الـ Middleware (تأكد إنك عملت الملف ده في الخطوة الجاية)
const { ensureAuth, ensureAdmin } = require("../middleware/authMiddleware");

// ===========================================
// 1. مسارات عامة (Public Routes)
// ===========================================
router.get("/", (req, res) => {
  res.send("Home Page - Welcome Everyone 👋");
});

// ===========================================
// 2. عمليات المصادقة (Auth Logic)
// ===========================================

// تسجيل مستخدم جديد
router.post("/add-user", userController.createUser);
router.get("/get-users", userController.getAllUsers);

// تسجيل الدخول العادي (Local)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({ message: "Login Successful ✅", user });
    });
  })(req, res, next);
});

// تسجيل الدخول بجوجل (Google)
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  (req, res) => {
    // قم بتغيير السطر ليكون هكذا:
    res.redirect("https://google-login-frontend-coral.vercel.app/dashboard");
  }
);

// تسجيل الخروج
router.get("/api/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("https://google-login-frontend-coral.vercel.app");
  });
});

// ===========================================
// 3. مسارات محمية (Protected Routes) 🛡️
// ===========================================

// معرفة المستخدم الحالي (للفرونت إند)
router.get("/api/current_user", (req, res) => {
  res.send(req.user || null);
});

// صفحة البروفايل (تتطلب تسجيل دخول)
router.get("/profile", ensureAuth, (req, res) => {
  res.json({
    message: "Welcome back 👤",
    user: req.user,
  });
});

// لوحة تحكم الأدمن (تتطلب أدمن)
router.get("/dashboard", ensureAdmin, (req, res) => {
  res.send("Admin Dashboard - Top Secret Data 🤫");
});

module.exports = router;
