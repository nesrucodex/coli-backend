import mongoose, { Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { IUser } from "../types/global";
dotenv.config();
const { Schema, model } = mongoose;

const SECRET = process.env.SECRET!;


interface IUserMethods {
  createToken: () => string;
}

interface UserModel extends Model<IUser, {}, IUserMethods> {}

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  name: {
    type: String,
    required: [true, "Full name is required"],
    minlength: [
      7,
      "The minimum length of the user's name should be at least 7",
    ],
    maxlength: [
      50,
      "The maximum length of the user's name should be at most 50",
    ],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [/\D{1}\w*@gmail.com/, "User provided invalid email"],
    lowercase: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Minimum length of the passoword have to be 6"],
  },
  profile: {
    type: String,
    required: [true, "Profile is required"],
  },
});

userSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(8);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.createToken = function () {
  return jwt.sign({ userId: this._id, name: this.name }, SECRET, {
    expiresIn: "2d",
  });
};
const User = model("User", userSchema);
export default User;
