import { Router } from "express";
import categoryService from "./category.service";
import { Request, Response, NextFunction } from "express";
import ApiError from "../../utils/apiErrors";
import { z } from "zod";
import { UserRoles } from "../User/users.interface";
import { isAuthenticated } from "../../middleware/auth.middleware";
import { addCategorySchema, updateCategorySchema } from "./category.validation";



const validate = (schema: z.ZodTypeAny) => async(req: Request, res: Response, next: NextFunction) => {
    
    try {
        await schema.parseAsync(req.body);
        return next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(error.errors.map((err) => err.message).join(', '), 400));
        }
        return next(error);
    }
}

const  categoryRouter : Router= Router();


categoryRouter.get('/',
    categoryService.getAllCategories);


categoryRouter.get('/:id',
    categoryService.getCategoryById);


categoryRouter.post('/',
    isAuthenticated([UserRoles.MANAGER]),
    validate(addCategorySchema),
    categoryService.addCategory);


categoryRouter.put('/:id',
    isAuthenticated([UserRoles.MANAGER]),
    validate(updateCategorySchema),
    categoryService.updateCategory);

categoryRouter.delete('/:id',
    isAuthenticated([UserRoles.MANAGER]),
    categoryService.deleteCategory);


export default categoryRouter;
