import JWT from "jsonwebtoken";

const secret = "765v67@$#nfinkqweo293798";

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
