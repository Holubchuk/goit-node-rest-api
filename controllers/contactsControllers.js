import {
  listContacts,
  addContact,
  getOneOwnerContact,
  updateOneContact,
  removeOneContact,
  updateStatusOneContact,
} from "../services/contactsServices.js";

import HttpError from "../helpers/HttpError.js";

import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";

import { ctrlWrapper } from "../decorators/ctrlWrapper.js";

export const getAllContacts = ctrlWrapper(async (req, res) => {
  const {_id: owner} = req.user;
  const {page = 1, limit = 20} = req.query;
  const skip = (page - 1) * limit;

  const result = await listContacts({owner}, {skip, limit});

  res.json(result);
});

export const getOneContact = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const {_id: owner} = req.user;
  const result = await getOneOwnerContact({_id: id, owner});
  if (!result) {
    throw HttpError(404, `Contact with id:${id} not found`);
  }
  res.json(result);
});

export const deleteContact = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const {_id: owner} = req.user;
  const result = await removeOneContact({_id: id, owner});
  if (!result) {
    throw HttpError(404, `Contact with id:${id} not found`);
  }
  res.json({
    message: "Delete success",
  });
});

export const createContact = ctrlWrapper(async (req, res) => {
  const { error } = createContactSchema.validate(req.body);
  const {_id: owner} = req.user;
  if (error) {
    throw HttpError(400, error.message);
  }
  const result = await addContact({...req.body, owner});

  res.status(201).json(result);
});

export const updateContact = ctrlWrapper(async (req, res) => {
  const { error } = updateContactSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { id } = req.params;
  const {_id: owner} = req.user;
  const result = await updateOneContact({_id: id, owner}, req.body);
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
  const {_id: owner} = req.user;
  const result = await updateStatusOneContact({_id: id, owner}, req.body);
  if (!result) {
    throw HttpError(404, `Contact with id:${id} not found`);
  }

  res.status(200).json(result);
});
