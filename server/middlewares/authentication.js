import { validateToken } from "../services/authentication.js";

async function restrictToLoggedinUserOnly(req, res, next) {
  const userUid = req.get("X-sessionID");
  if (!userUid) return res.redirect("/login");
  let user;
  try {
    user = validateToken(userUid);
  } catch (err) {
    return res.json({ error: "Invalid session ID" });
  }
  if (!user) return res.redirect("/login");

  req.user = user;
  next();
}


export { restrictToLoggedinUserOnly };
