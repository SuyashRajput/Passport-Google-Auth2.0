const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback",
      },
      async function (accessToken, refreshToken, profile, cb) {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            return cb(null, user);
          } else {
            const newUser = {
              googleId: profile.id,
              name: profile.displayName,
              image: profile.photos[0].value,
            };
            user = await User.create(newUser);
            cb(null, user);
          }
        } catch (err) {
          console.log(err);
        }
      }
    )
  );
};
