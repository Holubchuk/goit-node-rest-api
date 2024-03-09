import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContactById,
  updateStatusContact,
} from "../services/contactsServices.js";

import HttpError from "../helpers/HttpError.js";

import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";

import { ctrlWrapper } from "../decorators/ctrlWrapper.js";

export const getAllContacts = ctrlWrapper(async (req, res) => {
  const result = await listContacts();

  res.json(result);
});

export const getOneContact = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const result = await getContactById(id);
  if (!result) {
    throw HttpError(404, `Contact with id:${id} not found`);
  }
  res.json(result);
});

export const deleteContact = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const result = await removeContact(id);
  if (!result) {
    throw HttpError(404, `Contact with id:${id} not found`);
  }
  res.json({
    message: "Delete success",
  });
});

export const createContact = ctrlWrapper(async (req, res) => {
  const { error } = createContactSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const result = await addContact(req.body);

  res.status(201).json(result);
});

export const updateContact = ctrlWrapper(async (req, res) => {
  const { error } = updateContactSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { id } = req.params;
  const result = await updateContactById(id, req.body);
  if (!result) {
    throw HttpError(404, `Contact with id:${id} not found`);
  }

  res.json(result);
});

export const updateStatusContactById = ctrlWrapper(async (req, res) => {
  const { error } = updateContactSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { id } = req.params;
  const result = await updateStatusContact(id, req.body);
  if (!result) {
    throw HttpError(404, `Contact with id:${id} not found`);
  }

  res.status(200).json(result);
});
