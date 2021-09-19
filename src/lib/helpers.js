import jwt from "jsonwebtoken";

export const JWT = {
  secretKey: "1q@w3e4r5t6y",
};

const EXPIRED_IN = 43200;
// 12 jam token akan expire
const TOKEN_EXPIRATION = 43200000;
// renew token di menit terakhir
const EXPIRATION_WINDOW = 600000;

export const checkJwt = async (decode, request) => {
  try {
    const session = decode.id;
    if (session) {
      const now = new Date().getTime();
      if (now > decode.exp) {
        return null;
      }

      if (decode.exp - now <= EXPIRATION_WINDOW) {
        decode.exp = now + TOKEN_EXPIRATION; // tambah 10 menit
      }

      // session is valid
      try {
        return { isValid: true, credentials: { users: decode } };
      } catch (error) {
        return error;
      }
    }

    return { isValid: false };
  } catch (error) {
    return error;
  }
};

export const initAuthentication = (server) => {
  server.auth.strategy("jwt", "jwt", {
    key: JWT.secretKey,
    validate: checkJwt,
    verifyOptions: { algorithms: ["HS256"] },
  });
};

export const generateToken = (users) => {
  const obj = {
    id: users.user_id,
    name: users.name,
    email: users.email,
  };

  return jwt.sign(obj, JWT.secretKey, {
    expiresIn: "12h",
  });
};