const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const oauthService = require('../services/oauthService');

// Google Strategy Configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (!email) {
        return done(new Error('No email address found in your Google profile. Google authentication requires a verified email.'), null);
      }
      
      const user = await oauthService.findOrCreateOAuthUser({
        provider: 'google',
        providerId: profile.id,
        email
      });
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// GitHub Strategy Configuration
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/github/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

      // Note: GitHub profiles may not expose email publicly in profile.emails if the user has it set to private.
      // As a robust solution, we fetch all emails from the /user/emails GitHub API if it is not present in the profile.
      if (!email && accessToken) {
        try {
          const res = await fetch('https://api.github.com/user/emails', {
            headers: {
              'Authorization': `token ${accessToken}`,
              'User-Agent': 'Resonance-App'
            }
          });
          if (res.ok) {
            const emails = await res.json();
            // Locate the primary, verified email or fallback to the first email found
            const primaryEmailObj = emails.find(e => e.primary) || emails[0];
            if (primaryEmailObj) {
              email = primaryEmailObj.email;
            }
          }
        } catch (fetchErr) {
          console.error('Error fetching email addresses from GitHub API:', fetchErr);
        }
      }

      // If email is still unavailable, raise it as a known limitation for profiles with private email addresses.
      if (!email) {
        return done(new Error('No email address found or accessible in your GitHub profile. Please ensure your email is public in GitHub settings or use another sign-in method.'), null);
      }

      const user = await oauthService.findOrCreateOAuthUser({
        provider: 'github',
        providerId: profile.id,
        email
      });
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;
