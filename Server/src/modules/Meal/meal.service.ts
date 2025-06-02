import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import ApiError from "../../utils/apiErrors";
import { Meal } from "./meal.interface";
import mealSchema from "./meal.schema";
import { uploadSingleFile } from "../../middleware/uploadFiles.middleware";
import sharp from "sharp";
import cloudinary from "../../utils/cloudinary";
import { resolveStockItems } from "../Stock/stockResolver.service";




class MealsService {


  createMeals: any = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {


    try {   
              // تحويل البيانات الواردة

        const ingredients = this.parseIngredients(req.body);

              // حل المراجع إلى أحدث مخزون

        const resolvedIngredients = await resolveStockItems(ingredients);

        const meal = await mealSchema.create({
            
            ...req.body,
            ingredients: resolvedIngredients,
        });
        await meal.populate([
            
            {path: 'categoryId', select: 'name'},
            {path: 'ingredients.stockItemId', select: 'name quantity unit '},
        ]);

        res.status(201).json({
            success: true,
            message: 'Meal created successfully',
            data: meal})
        
    } catch (error) {
        next(error);
    }
});
    private parseIngredients(body: any): Array<{
    stockName: string;
    quantityUsed: number;
    unit : string;
    status : string
  }> {
    const ingredients: any[] = body.ingredients || [];
    
    Object.keys(body).forEach((key) => {
      const match = key.match(/^ingredients\[(\d+)]\[(\w+)]$/);
      if (match) {
        const index = parseInt(match[1]);
        const field = match[2];

        if (!ingredients[index]) {
          ingredients[index] = {};
        }

        const mappedField = field === 'stockItem' ? 'stockName' : field;
        ingredients[index][mappedField] = body[key];
      }
    });

    return ingredients.map(item => ({
      stockName: item.stockName || item.stockItem,
      quantityUsed: item.quantityUsed ? parseFloat(item.quantityUsed) : 0,
      unit: item.unit || 'pcs',
      status : item.status
    }));
  }



    getMealById : any = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        const meal : Meal | null = await mealSchema.findById(req.params.id);
        if(!meal) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(200).json({message: "Meal fetched successfully",data: meal});
    })

    getAllMeals: any = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        const meals : Meal [] = await mealSchema.find()
        if(!meals) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(200).json({message: "Meals fetched successfully",data: meals});
    })


    updateMeal : any = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        const meal : Meal | null = await mealSchema.findByIdAndUpdate(req.params.id,
             {
                 $set : req.body


             }, {new: true});
        if(!meal) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(200).json({message: "Meal updated successfully",data: meal});
    })


   deleteMeal : any = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        const meal : Meal | null = await mealSchema.findByIdAndDelete(req.params.id);
        if(!meal) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(200).json({message: "Meal deleted successfully",data: meal});
    })


     uploadImage = uploadSingleFile(['image'], 'image');

     saveImage = async (req: Request, res: Response, next: NextFunction) => {
         
        try {
         if(req.file) {
             const buffer = await sharp(req.file.buffer)
                 .resize(1200, 1200)
                 .webp({ quality: 95 })
                 .toBuffer();

                 const uploadFromBuffer = (buffer: Buffer) => {
                     return new Promise((resolve, reject) => {

                         const stream = cloudinary.uploader.upload_stream(
                             {
                                 resource_type : "image",
                                 folder : "meal",
                                 format : "webp",
                             },
                             (error,result) => {
                                 if(error) {
                                     console.error("Cloudinary Error:", error); // Debug
                                     reject(error);
                                 }else{
                                     resolve(result);
                                 }
                             }
                         );
                         stream.write(buffer);
                         stream.end();
                     })
                 };

                 const result: any = await uploadFromBuffer(buffer);
                req.body.image = {
                    url : result.secure_url,
                    publicId : result.public_id
                }
         }
         next();
        }catch (error){
         console.error("Upload failed",error) 
         return next (new ApiError("Image upload failed",500))
        }

     }

       private async deleteImage (publicId: string): Promise<void> {
           
          try {
             await cloudinary.uploader.destroy(publicId);
          } catch (error) {
             console.log("Failed to delete user image from cloudinary", error);
             throw error;
          }
       }

        deleteMealImage = expressAsyncHandler(
           async (req: Request, res: Response, next: NextFunction) => {
       
               const meal = await mealSchema.findById(req.params.id);
               if(!meal) return next(new ApiError(`${req.__("not_found")}`, 404));
       
               if (
       
                   meal.image &&
                   typeof meal.image === "object" &&
                   "publicId" in meal.image &&
                   meal.image.publicId &&
                   !meal.image.url.startsWith(`$process.env.BASE_URL /images/meal/meal-default.png` )
               ){
                   try {
                       await this.deleteImage(meal.image.publicId);
                       meal.image = {
                           url : 'meal-default.png',
                           publicId : ''
                       };
                       await meal.save();
       
                   } catch (error) {
                       return next(new ApiError("Image upload failed", 500));
                   }
               }
       
               res
               .status(200)
               .json({ message: "User image deleted successfully", data: meal });
       
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
                         folder: "meal",
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


    



const mealsService = new MealsService();

export default mealsService