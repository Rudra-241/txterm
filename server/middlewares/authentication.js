import { validateToken } from "../services/authentication.js";

async function restrictToLoggedinUserOnly(req, res, next) {
  const userUid = req.get("X-sessionID");
  if (!userUid) return res.json({message:"Firstly login please"});
  let user;
  try {
    user = validateToken(userUid);
  } catch (err) {
    return res.json({ error: "Invalid session ID" });
  }
  if (!user) return res.json({message:"Firstly login please"});

  req.user = user;
  next();
}


export { restrictToLoggedinUserOnly };
