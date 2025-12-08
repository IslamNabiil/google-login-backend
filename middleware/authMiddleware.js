exports.ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ message: "Unauthorized" });
  //   res.redirect("http://localhost:5173/");
};

exports.ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "Admin") {
    return next();
  }

  res.status(403).json({ message: "Forbidden" });
};
