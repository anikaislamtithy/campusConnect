const CustomError = require('../errors');
const { isTokenValid } = require('../utils');
const Token = require('../models/Token');
const { attachCookiesToResponse } = require('../utils');
const authenticateUser = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;

  // Check for Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  // console.log('Auth middleware - Bearer token:', !!token);
  // console.log('Auth middleware - Access token cookie:', !!accessToken);
  // console.log('Auth middleware - Refresh token cookie:', !!refreshToken);

  try {
    // First try the Authorization header token
    if (token) {
      // console.log('Validating Bearer token...');
      const payload = isTokenValid(token);
      // console.log('Bearer token payload:', payload);
      req.user = payload.user;
      return next();
    }

    // Then try the access token from cookies
    if (accessToken) {
      // console.log('Validating access token cookie...');
      const payload = isTokenValid(accessToken);
      // console.log('Access token payload:', payload);
      req.user = payload.user;
      return next();
    }

    // Finally try the refresh token from cookies
    if (refreshToken) {
      // console.log('Validating refresh token cookie...');
      const payload = isTokenValid(refreshToken);
      // console.log('Refresh token payload:', payload);

      const existingToken = await Token.findOne({
        user: payload.user.userId,
        refreshToken: payload.refreshToken,
      });

      if (!existingToken || !existingToken?.isValid) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid');
      }

      attachCookiesToResponse({
        res,
        user: payload.user,
        refreshToken: existingToken.refreshToken,
      });

      req.user = payload.user;
      return next();
    }

    console.log('No valid authentication method found');
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  } catch (error) {
    console.error('Authentication error:', error.message);
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
