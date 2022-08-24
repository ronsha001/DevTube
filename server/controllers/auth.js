import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { createError } from "../error.js";

export const signup = async (req, res, next) => {
  try {
    const hashedPw = await bcrypt.hash(req.body.password, 12);
    const newUser = new User({ ...req.body, password: hashedPw });

    await newUser.save();
    res.status(200).json("User has been created!");
  } catch (err) {
    next(err);
  }
};
export const signin = async (req, res, next) => {
  try {
    const user = await User.findOne({ name: req.body.name });
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const isCorrect = await bcrypt.compare(req.body.password, user.password);
    if (!isCorrect) {
      return next(createError(400, "Wrong Credentials!"));
    }

    const token = jwt.sign(
      {
        email: user.email,
        id: user._id.toString(),
      },
      process.env.SECRET_JWT_KEY,
      { expiresIn: "1h" }
    );

    const { password, ...others } = user._doc;

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ others });
  } catch (err) {
    next(err);
  }
};
export const google = async (req, res, next) => {};
