import { verifyAccessToken } from "../utils/jwt.js";
import { unauthorized } from "../utils/errors.js";

export function authenticate(req, _res, next) {
  try {
    const token =
      req.cookies?.access_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) throw unauthorized();

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    next(unauthorized());
  }
}

export function optionalAuthenticate(req, _res, next) {
  try {
    const token =
      req.cookies?.access_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (token) {
      req.user = verifyAccessToken(token);
    } else {
      req.user = { role: "public" };
    }
  } catch {
    req.user = { role: "public" };
  }
  next();
}
