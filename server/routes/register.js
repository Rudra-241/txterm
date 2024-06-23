import express from "express";
import { handleUserRegistration } from "../controllers/register.js";

const router = express.Router();
router.post("/", handleUserRegistration);

export { router };
