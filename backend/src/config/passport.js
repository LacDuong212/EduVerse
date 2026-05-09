import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "#modules/user/user.model.js";
import { toAuthUserDto } from "#modules/user/user.mapper.js";

export default function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const googleId = profile.id;
        const pfpImg = profile.photos[0].value;

        try {
          let user = await userModel.findOne({ googleId: googleId });
          if (user) {
            return done(null, toAuthUserDto(user));
          }

          user = await userModel.findOne({ email: email });
          if (user) {
            user.googleId = googleId;
            if (!user.pfpImg) {
              user.pfpImg = pfpImg;
            }
            await user.save();
            return done(null, toAuthUserDto(user));
          }

          const newUser = await userModel.create({
            googleId: googleId,
            name: name,
            email: email,
            pfpImg: pfpImg,
            isVerified: true,
          });
          return done(null, toAuthUserDto(newUser));

        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.userId);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);
      done(null, toAuthUserDto(user));
    } catch (err) {
      done(err, null);
    }
  });
}