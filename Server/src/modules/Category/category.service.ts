
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import ApiError from "../../utils/apiErrors";
import { z } from "zod";
import { Category } from "./category.interface";
import categorySchema from "./category.schema";
import { addCategorySchema, updateCategorySchema } from "./category.validation";



class CategoryService {


    addCategory : any = expressAsyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try{
                const validatedData = addCategorySchema.parse(req.body);

                const category: Category  = await categorySchema.create(validatedData);

        if(!category) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(201).json({message:"Category created successfully",data: category});
       }
       catch(error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(error.errors.map((err) => err.message).join(', '), 400));
        }
        return next(error);
        }
    }
)

    getCategoryById : any = expressAsyncHandler(async(req: Request,res: Response, next: NextFunction): Promise<void> =>{


        const category : Category | null = await categorySchema.findById(req.params.id);

        if(!category) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(200).json({message:"Category fetched successfully",data: category});
    })

    getAllCategories : any = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        const categories : Category [] = await categorySchema.find();

        if(!categories) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(200).json({message:"Categories fetched successfully",data: categories});
        
    })

    updateCategory : any = expressAsyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {

            try{

            
        const validatedData = updateCategorySchema.parse(req.body);
        const category : Category | null = await categorySchema.findByIdAndUpdate(
            req.params.id,
            validatedData,
             {new: true});

        if(!category) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(200).json({message:"Category updated successfully",data: category});
    }
    catch(error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(error.errors.map((err) => err.message).join(', '), 400));
        }
        return next(error);
    }
   
    })

    deleteCategory : any = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {


        const category : Category | null = await categorySchema.findByIdAndDelete(req.params.id);

        if(!category) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(200).json({message:"Category deleted successfully",data: category});
    })


}

const categoryService = new CategoryService();

export default categoryService