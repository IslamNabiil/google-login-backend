const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModels");

// حفظ الـ user ID داخل الـ session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// استرجاع بيانات المستخدم من الـ session
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => done(err, null));
});

// Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "name",
      passwordField: "password",
    },
    async (name, password, done) => {
      try {
        const user = await User.findOne({ name });
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        if (!user.password) {
          return done(null, false, { message: "Login with Google" });
        }
        const isMatch = await user.matchedPassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid Password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: process.env.REDIRECT_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;

        let user = await User.findOne({ googleId });

        if (!user) {
          user = await User.create({
            googleId,
            name: profile.displayName,
            email,
            profileImg: profile.photos[0].value,
            role: "User",
          });
        }

        done(null, user);
      } catch (error) {
        console.error("Passport Google Strategy Error:", error);
        done(error, null);
      }
    }
  )
);
