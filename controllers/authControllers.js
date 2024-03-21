import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import Jimp from "jimp";

import fs from "fs/promises";
import path from "path";

import {
  findUser,
  hashPassword,
  updateUser,
  validatePassword,
} from "../services/authServices.js";

import HttpError from "../helpers/HttpError.js";

import { ctrlWrapper } from "../decorators/ctrlWrapper.js";

const { JWT_SECRET } = process.env;

const avatarsPath = path.resolve("public", "avatars");

export const signup = ctrlWrapper(async (req, res) => {
  const { email } = req.body;
  const user = await findUser({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  const avatarURL = gravatar.url(email, { s: "250", r: "pg", d: "identicon" });
  const newUser = await hashPassword({ ...req.body, avatarURL });

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
    avatarURL: newUser.avatarURL,
  });
});

export const signin = ctrlWrapper(async (req, res) => {
  const { email, password } = req.body;
  const user = await findUser({ email });
  if (!user) {
    throw HttpError(401, "Email or password valid");
  }
  const comparePassword = await validatePassword(password, user.password);
  if (!comparePassword) {
    throw HttpError(401, "Email or password valid");
  }

  const { _id: id } = user;

  const payload = {
    id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await updateUser({ _id: id }, { token });

  res.json({
    token,
  });
});

export const getCurrent = ctrlWrapper(async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
});

export const signout = ctrlWrapper(async (req, res) => {
  const { _id } = req.user;
  await updateUser({ _id }, { token: "" });

  res.json({
    message: "Signout success",
  });
});

export const updateUserAvatar = ctrlWrapper(async (req, res) => {
  const { _id, email } = req.user;

  const user = await findUser({ email });
  console.log(email);
  if (!user) {
    throw HttpError(401, "Not authorized");
  }

  const { path: oldPath, filename } = req.file;
  const newPath = path.join(avatarsPath, filename);

  const image = await Jimp.read(oldPath);
  image.resize(250, 250).writeAsync(newPath);

  const newAvatar = path.join("avatars", filename);

  await updateUser({ _id }, { avatarURL: newAvatar });

  res.status(200).json(`avatarURL: ${newAvatar}`);
});
