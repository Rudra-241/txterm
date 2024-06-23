import { hashPassword } from "../services/hashPasswords.js";
import { user } from "../models/user.js";

const handleUserRegistration = async (req, res) => {
  try {
    const username = req.query.username;
    const password = req.query.password;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const hashedPassword = await hashPassword(password);
    const entry = await user.insertMany({
      username: username,
      password: hashedPassword,
    });

    res.json({ message: "User registered successfully", entry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { handleUserRegistration };
