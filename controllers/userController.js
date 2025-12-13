const User = require("../models/userModels");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, profileImg } = req.body;

    // 1. تصحيح الشرط: استخدام || بدل الفاصلة
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const isExists = await User.findOne({ email });
    if (isExists) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: role || "User",
      profileImg,
    });

    res.status(201).json({
      message: "User created Successfully ✅",
      data: {
        // 2. تصحيح المتغير: استخدام newUser بدل User
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profileImg: newUser.profileImg,
      },
    });
  } catch (error) {
    console.error("Error creating User:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({ message: "Users fetched Successfully:", data: users });
  } catch (error) {
    console.error("Error fetching Users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ message: "username and password are required ⚠️" });
    }

    const user = await User.findOne({ name });
    if (!user) {
      return res.status(400).json({ message: "Username not found 🤔" });
    }

    const isMatch = await user.matchedPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password ❌" });
    }

    // 3. تصحيح التوكن: بناخد البيانات من user اللي لقيناه
    const token = jwt.sign(
      { id: user._id, role: user.role }, // user._id مش User._id
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successfully 👏",
      token,
      data: {
        // نفس الكلام هنا
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg // ضفتلك الصورة عشان تعرضها في الفرونت
      },
    });
  } catch (error) {
    console.error("Error logging in User:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};