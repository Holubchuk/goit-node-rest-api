import express from "express";
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateStatusContactById,
} from "../controllers/contactsControllers.js";

import {isValidId} from '../middlewares/isValidId.js'
import {authenticate} from '../middlewares/authenticate.js'
import {upload} from "../middlewares/upload.js";

const contactsRouter = express.Router();

contactsRouter.use(authenticate);

contactsRouter.get("/", getAllContacts);

contactsRouter.get("/:id", isValidId, getOneContact);

contactsRouter.delete("/:id", isValidId, deleteContact);

contactsRouter.post("/", upload.single("avatars"), createContact);

contactsRouter.put("/:id", isValidId, updateContact);

contactsRouter.patch("/:id/favorite", isValidId, updateStatusContactById);

export default contactsRouter;
