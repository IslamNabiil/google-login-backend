const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoute"); // ده الملف الشامل اللي فيه كل حاجة

// 1. إعدادات البيئة
dotenv.config();

// تحميل إعدادات Passport
require("./config/passport");

const port = process.env.PORT || 5000;

// بدء التطبيق
const app = express();

// ==========================================
// 2. Middleware
// ==========================================

// أ) CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ب) Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ج) Session
app.use(
  session({
    secret: process.env.COOKIE_KEY, // تأكد إن ده موجود في ملف .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // خليها false طول ما احنا local development
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// د) Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// ==========================================
// 3. Routes
// ==========================================

// هنستخدم ملف واحد مجمع لكل عمليات اليوزر (تسجيل، دخول عادي، دخول جوجل)
app.use(userRoutes); 

app.get("/", (req, res) => {
  res.send("API is running...");
});

// ==========================================
// 4. Server Start
// ==========================================
// connectDB()
//   .then(() => {
//     app.listen(port, () => {
//       console.log(`🚀 Server is running on port ${port}`);
//     });
//   })
//   .catch((err) => {
//     console.error("Failed to connect to DB", err);
//   });

// الكود الجديد المتوافق مع Vercel
connectDB(); // الاتصال بالداتا بيز

// لازم نصدر التطبيق عشان Vercel يعرف يشغله
module.exports = app;

// الجزء ده عشان لو حبيت تشغله على جهازك يشتغل عادي
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
}