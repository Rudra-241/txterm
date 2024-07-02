import { validateToken } from "../services/authentication.js";

async function restrictToLoggedinUserOnly(req, res, next) {
  const userUid = req.get("X-sessionID");
  if (!userUid) return res.json({ message: "Firstly login please" });
  let user;
  try {
    user = validateToken(userUid);
  } catch (err) {
    return res.json({ error: "Invalid session ID" });
  }
  if (!user) return res.json({ message: "Firstly login please" });

  req.user = user;
  next();
}

async function checkAuth(userUid) {
  if (!userUid) return null;
  let user;
  try {
    user = validateToken(userUid);
  } catch (err) {
    return null;
  }
  if (!user) return null;

  return user;
}

export { restrictToLoggedinUserOnly, checkAuth };
