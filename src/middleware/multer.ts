import multer from "multer";
import path from "path";
import { Request } from "express";

const teamProfileStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    const destinationPath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "teams",
      "profiles"
    );

    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const userProfileStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    const destinationPath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "users",
      "profiles"
    );

    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const commonFileFilter = (
  _: Request,
  file: Express.Multer.File,
  cb: (error: any, status: boolean) => void
) => {
  const allowedExtensions = [".png", ".jpg", ".jpeg"];
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension))
    cb(new Error("Unsupported image format"), false);
  else cb(null, true);
};

export const teamProfileUploader = multer({
  fileFilter: commonFileFilter,
  storage: teamProfileStorage,
});
export const userProfileUploader = multer({
  fileFilter: commonFileFilter,
  storage: userProfileStorage,
});
