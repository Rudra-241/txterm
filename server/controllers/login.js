import { pbkdf2 } from "node:crypto";
import { user } from "../models/user.js";
import {
  validateToken,
  createTokenForUser,
} from "../services/authentication.js";

const verifyPassword = async (storedHash, passwordAttempt) => {
  const [salt, key] = storedHash.split(":");
  const iterations = 100000;
  const keyLength = 64;
  const digest = "sha512";

  return new Promise((resolve, reject) => {
    pbkdf2(
      passwordAttempt,
      salt,
      iterations,
      keyLength,
      digest,
      (err, derivedKey) => {
        if (err) reject(err);
        resolve(key === derivedKey.toString("hex"));
      }
    );
  });
};

const handleUserLogin = async (req, res) => {
  try {
    
    const username = req.query.username;
    const password = req.query.password;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const usr = await user.findOne({ username: username });
    if (!usr) {
      return res
      .status(400)
      .json({ error: `No user named ${username} found` });
    }
    const isCorrect = await verifyPassword(usr.password, password);
    if (isCorrect) {
      // console.log("hello");
      const token = createTokenForUser(usr);
      console.log(token);

      res.json({"uid": token,"user":usr});
      // return res.redirect("/chat");
    } else {
      res.json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { handleUserLogin };
