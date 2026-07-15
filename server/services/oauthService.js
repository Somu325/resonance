const User = require('../models/User');

/**
 * Resolves an OAuth user by finding an existing account or creating a new one.
 * 
 * @param {Object} params
 * @param {string} params.provider - The name of the OAuth provider ('github' or 'google')
 * @param {string} params.providerId - The unique ID assigned by the OAuth provider
 * @param {string} params.email - The user's email address returned by the provider
 * @returns {Promise<Object>} The resolved User mongoose document
 */
async function findOrCreateOAuthUser({ provider, providerId, email }) {
  // Determine which schema field corresponds to the given OAuth provider
  const idField = provider === 'github' ? 'githubId' : 'googleId';

  // Branch 1: Check for an existing user already associated with this provider's ID.
  // This handles recurring OAuth log-ins for the same provider.
  const existingUserById = await User.findOne({ [idField]: providerId });
  if (existingUserById) {
    return existingUserById;
  }

  // Branch 2: Check for an existing user sharing the same email address.
  // If found, we link the provider's ID to this existing account (which could have
  // been created originally via password or another OAuth provider) and save it.
  if (email) {
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      existingUserByEmail[idField] = providerId;
      await existingUserByEmail.save();
      return existingUserByEmail;
    }
  }

  // Branch 3: Create a brand new user.
  // If neither the provider ID nor the email exists in our system, we register a new account
  // without a password, populating only the email and the provider-specific ID.
  const newUser = new User({
    email,
    [idField]: providerId,
    isVerified: true,
  });

  await newUser.save();
  return newUser;
}

module.exports = {
  findOrCreateOAuthUser,
};
