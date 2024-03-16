import jwt from "jsonwebtoken";

import {findUser, hashPassword, updateUser, validatePassword} from "../services/authServices.js";

import HttpError from "../helpers/HttpError.js";

import {ctrlWrapper} from "../decorators/ctrlWrapper.js";

const {JWT_SECRET} = process.env;

export const signup = ctrlWrapper(async(req, res) => {
    const {email} = req.body;
    const user = await findUser({email});
    if(user) {
        throw HttpError(409, "Email in use");
    }
    
    const newUser = await hashPassword(req.body);

    res.status(201).json({
        email: newUser.email,
        subscription: newUser.subscription,
    })
})

export const signin = ctrlWrapper(async(req, res) => {
    const {email, password} = req.body;
    const user = await findUser({email});
    if(!user) {
        throw HttpError(401, "Email or password valid");
    }
    const comparePassword = await validatePassword(password, user.password);
    if(!comparePassword) {
        throw HttpError(401, "Email or password valid");
    }

    const {_id: id} = user;

    const payload = {
        id,
    }

    const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "23h"});
    await updateUser({_id: id}, {token});

    res.json({
        token,      
    })
})

export const getCurrent = ctrlWrapper(async(req, res)=> {
    const {email, subscription} = req.user;

    res.json({
        email,
        subscription,
    })
})

export const signout = ctrlWrapper(async(req, res)=> {
    const {_id} = req.user;
    await updateUser({_id}, {token: ""});

    res.json({
        message: "Signout success"
    })
})