import express from "express";

import {signup, signin} from "../controllers/authControllers.js"

import validateBody from "../helpers/validateBody.js";

import {userSignupSchema, userSigninSchema} from "../schemas/usersSchemas.js";

const authRouter = express.Router();

authRouter.post("/register", validateBody(userSignupSchema), signup);

authRouter.post("/login", validateBody(userSigninSchema), signin);

export default authRouter;