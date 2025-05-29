import expressAsyncHandler from "express-async-handler";
import refactorService from "../../refactor.service";
import { Users, UserRoles } from "./users.interface";
import usersSchema from "./users.schema";
import { NextFunction, Request, Response } from "express";
import ApiError from "../../utils/apiErrors";
import { uploadSingleFile } from "../../middleware/uploadFiles.middleware";
import sharp from "sharp";
import sanitization from "../../utils/sanitization";
import cloudinary from "../../utils/cloudinary";

class UsersService {
  getAllUsers = refactorService.getAll<Users>(usersSchema, "Users");

  createUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await usersSchema.create(req.body);
      res.status(201).json({ message: "User created successfully", data: sanitization.User(user) });
    }
  );

  getUserById = refactorService.getOneById<Users>(usersSchema);

  updateUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user: Users | null = await usersSchema.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );

      if (!user) return next(new ApiError(`${req.__("not_found")}`, 404));
      res
        .status(200)
        .json({ message: "User updated successfully", data: sanitization.User(user) });
    }
  );

  changePassword = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user: Users | null = await usersSchema.findByIdAndUpdate(
        req.params.id,
        {
          password: req.body.password,
          passwordChangedAt: Date.now(),
        },
        { new: true }
      );

      if (!user) return next(new ApiError(`${req.__("not_found")}`, 404));
      res
        .status(200)
        .json({ message: "Password updated successfully", data: sanitization.User(user) });
    }
  );

  deleteUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user: Users | null = await usersSchema.findByIdAndDelete(req.params.id);
  
      if (!user) return next(new ApiError(`${req.__("not_found")}`, 404));
  
      // Check and delete image from cloudinary if applicable
      if (
        user.image &&
        typeof user.image === "object" &&
        "publicId" in user.image &&
        user.image.publicId
      ) {
        const imageObj = user.image as { publicId: string };
        try {
          await this.deleteImage(imageObj.publicId);
        } catch (error) {
          console.log("Failed to delete user image from cloudinary", error);
        }
      }
  
      res
        .status(200)
        .json({ message: "User deleted successfully", data: sanitization.User(user) });
    }
  );

  private async deleteImage (publicId: string): Promise<void> {
      
     try {
        await cloudinary.uploader.destroy(publicId);
     } catch (error) {
        console.log("Failed to delete user image from cloudinary", error);
        throw error;
     }
  }
  

  uploadImage = uploadSingleFile(["image"], "image");

  saveImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {
        const buffer = await sharp(req.file.buffer)
          .resize(1200, 1200)
          .webp({ quality: 95 })
          .toBuffer();

        const uploadFromBuffer = (buffer: Buffer) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: "image",
                folder: "user",
                format: "webp",
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary Error:", error);
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
            stream.write(buffer);
            stream.end();
          });
        };

        const result: any = await uploadFromBuffer(buffer);
        req.body.image = {
          url: result.secure_url,
          publicId: result.public_id,
        };
      }
      next();
    } catch (error) {
      console.error("Upload failed", error);
      return next(new ApiError("Image upload failed", 500));
    }
  };

  deleteUserImage = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

        const user = await usersSchema.findById(req.params.id);
        if(!user) return next(new ApiError(`${req.__("not_found")}`, 404));

        if (

            user.image &&
            typeof user.image === "object" &&
            "publicId" in user.image &&
            user.image.publicId &&
            !user.image.url.startsWith(`$process.env.BASE_URL /images/user/user-default.png` )
        ){
            try {
                await this.deleteImage(user.image.publicId);
                user.image = {
                    url : 'user-default.png',
                    publicId : ''
                };
                await user.save();

            } catch (error) {
                return next(new ApiError("Image upload failed", 500));
            }
        }

        res
        .status(200)
        .json({ message: "User image deleted successfully", data: sanitization.User(user) });

    }
  )
   
  updateImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {
        const oldImageId = req.body.oldImageId;

        if (oldImageId) {
          await cloudinary.uploader.destroy(oldImageId, { resource_type: "image" });
        }

        const buffer = await sharp(req.file.buffer)
          .resize(1200, 1200)
          .webp({ quality: 95 })
          .toBuffer();

        const uploadFromBuffer = (buffer: Buffer) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: "image",
                folder: "user",
                format: "webp",
              },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            stream.write(buffer);
            stream.end();
          });
        };

        const result: any = await uploadFromBuffer(buffer);
        req.body.image = {
          url: result.secure_url,
          publicId: result.public_id,
        };
      }

      next();
    } catch (error) {
      console.error("Update failed", error);
      return next(new ApiError("Image update failed", 500));
    }
  };
}

const usersService = new UsersService();
export default usersService;
