const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    // 1. الاسم
    name: {
      type: String,
      required: [true, "Please enter your name"], // رسالة خطأ توضيحية
      trim: true, // بيشيل المسافات الزيادة قبل وبعد الاسم
    },

    // 2. البريد الإلكتروني
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true, // بيحفظ الايميل حروف صغيرة عشان ميتكررش
    },

    // 3. كلمة المرور (اختياري عشان جوجل)
    password: {
      type: String,
      required: false, // لو اليوزر سجل بجوجل مش هيكون فيه باسورد
      minlength: [6, "Password must be at least 6 characters"], // لو هيكتب باسورد يكون قوي شوية
    },

    // 4. الصورة الشخصية (الإضافة الجديدة) 🔥
    profileImg: {
      type: String,
      // ممكن نحط صورة افتراضية لو جوجل مرجعش صورة أو اليوزر مسحها
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },

    // 5. الصلاحيات
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },

    // 6. معرف جوجل (لربط الحساب)
    googleId: {
      type: String,
      unique: true,
      sparse: true, // ⬅️ مهم جداً: بيسمح بتكرار القيمة null لليوزرز العاديين
    },
  },
  {
    timestamps: true, // ⬅️ بيضيف حقول createdAt و updatedAt تلقائي
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // لو الرقم السري اتعدل اعمله تشفير

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchedPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
