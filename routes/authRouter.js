import express from "express";

import {
  signup,
  signin,
  getCurrent,
  signout,
  updateUserAvatar,
} from "../controllers/authControllers.js";

import validateBody from "../helpers/validateBody.js";

import { authenticate } from "../middlewares/authenticate.js";

import { userSignupSchema, userSigninSchema } from "../schemas/usersSchemas.js";

import { upload } from "../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post("/register", validateBody(userSignupSchema), signup);

authRouter.post("/login", validateBody(userSigninSchema), signin);

authRouter.get("/current", authenticate, getCurrent);

authRouter.post("/signout", authenticate, signout);

authRouter.patch("/avatars", authenticate, upload.single("avatar"), updateUserAvatar);

export default authRouter;
