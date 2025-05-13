import express from "express";
import { sendContactForm } from "../controllers/contactController.js";
import { compare } from "bcrypt";

const contactRouter = express.Router();

contactRouter.post("/contact", sendContactForm);

export default contactRouter;
