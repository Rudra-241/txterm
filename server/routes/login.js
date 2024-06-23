import express from "express";
import { handleUserLogin } from "../controllers/login.js";

const router = express.Router();
router.post("/", handleUserLogin);

export { router };
