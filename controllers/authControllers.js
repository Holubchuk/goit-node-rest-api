import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import Jimp from "jimp";
import { nanoid } from "nanoid";

import fs from "fs/promises";
import path from "path";

import {
  findUser,
  hashPassword,
  updateUser,
  validatePassword,
} from "../services/authServices.js";

import { sendEmail } from "../helpers/sendEmail.js";

import HttpError from "../helpers/HttpError.js";

import { ctrlWrapper } from "../decorators/ctrlWrapper.js";

const { JWT_SECRET, BASE_URL } = process.env;

const avatarsPath = path.resolve("public", "avatars");

export const signup = ctrlWrapper(async (req, res) => {
  const { email } = req.body;
  const user = await findUser({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  const avatarURL = gravatar.url(email, { s: "250", r: "pg", d: "identicon" });

  const verificationToken = nanoid();

  const newUser = await hashPassword({
    ...req.body,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a href="${BASE_URL}/api/users/verify/${verificationToken}" target="_blank">Click to verify</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
    avatarURL: newUser.avatarURL,
  });
});

export const verify = ctrlWrapper(async (req, res) => {
  const { verificationToken } = req.params;
  const user = await findUser({ verificationToken });
  if (!user) {
    throw HttpError(404, "VerificationToken not found");
  }
  await updateUser({ _id: user._id }, { verify: true, verificationToken: "" });

  res.json({
    message: "Verification successful",
  });
});

export const resendVerify = ctrlWrapper(async (req, res) => {
  const { email } = req.body;
  const user = await findUser({ email });
  if (!user) {
    throw HttpError(404, "Email not found");
  }
  if (user.verify) {
    throw HttpError(400, "Email already verify");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a href="${BASE_URL}/api/users/verify/${user.verificationToken}" target="_blank">Click to verify</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verify email send success",
  });
});

export const signin = ctrlWrapper(async (req, res) => {
  const { email, password } = req.body;
  const user = await findUser({ email });
  if (!user) {
    throw HttpError(401, "Email or password valid");
  }
  if (!user.verify) {
    throw HttpError(401, "Email not vefify");
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

  if (!user) {
    throw HttpError(401, "Not authorized");
  }
  if (!req.file) {
    throw HttpError(400, "Please, attach a file");
  }

  const { path: oldPath, filename } = req.file;
  const newPath = path.join(avatarsPath, filename);

  const image = await Jimp.read(oldPath);
  image.resize(250, 250).writeAsync(oldPath);
  await fs.rename(oldPath, newPath);

  const newAvatar = path.join("avatars", filename);

  await updateUser({ _id }, { avatarURL: newAvatar });

  res.status(200).json({ avatarURL: newAvatar });
});
