import JWT from "jsonwebtoken";
import 'dotenv/config'
const secret = process.env.JWT_SECRET;

function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    username: user.username,
    password: user.password,
  
  };
  const token = JWT.sign(payload, secret);
  return token;
}

function validateToken(token) {
  const payload = JWT.verify(token, secret);
  return payload;
}

export { createTokenForUser, validateToken };
