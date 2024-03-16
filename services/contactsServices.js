import Contact from "../models/Contacts.js";

export const listContacts = (filter = {}, query = {})=> Contact.find(filter, "-createdAt -updatedAt", query);

export const getContactById = id => Contact.findById(id);

export const getOneOwnerContact = filter => Contact.findOne(filter);

export const addContact = data => Contact.create(data);

export const updateContactById = (id, data) => Contact.findByIdAndUpdate(id, data);

export const updateOneContact = (filter, data) => Contact.findOneAndUpdate(filter, data);

export const removeContact = id => Contact.findByIdAndDelete(id);

export const removeOneContact = filter => Contact.findOneAndDelete(filter);

export const updateStatusContact = (id, data) => Contact.findByIdAndUpdate(id, data);

export const updateStatusOneContact = (filter, data) => Contact.findOneAndUpdate(filter, data);