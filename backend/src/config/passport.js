import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "#modules/user/user.model.js";
import { toAuthUserDto } from "#modules/user/user.mapper.js";
import { createNewStudent } from "#modules/student/student.service.js";

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
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const name = profile.displayName;
          const googleId = profile.id;
          const pfpImg = profile.photos?.[0]?.value;

          if (!email) {
            return done(null, false, { message: "Google account has no email." });
          }

          let user = await userModel.findOne({ googleId });

          if (user) {
            return done(null, toAuthUserDto(user));
          }

          user = await userModel.findOne({ email });

          if (user) {
            user.googleId = googleId;

            if (!user.pfpImg) {
              user.pfpImg = pfpImg;
            }

            user.isVerified = true;

            await user.save();

            return done(null, toAuthUserDto(user));
          }

          const newUser = await userModel.create({
            googleId,
            name,
            email,
            pfpImg,
            isVerified: true,
          });

          await createNewStudent(newUser._id);

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