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
    origin: "https://google-login-frontend-coral.vercel.app",
    credentials: true,
  })
);

// ب) Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', 1); // 👈 (ضيف هذا السطر)

// ج) Session
app.use(
  session({
    secret: process.env.COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // أسبوع
      secure: true, // 👈 لازم تكون True في بيئة HTTPS
      sameSite: 'none' // 👈 لازم تكون 'none' عشان الفرونت والباك مختلفين
    }
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