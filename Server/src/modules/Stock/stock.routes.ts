import { Router } from "express";
import storeService from "./stock.service";
import { Request, Response, NextFunction } from "express";
import ApiError from "../../utils/apiErrors";
import { z } from "zod";
import authService from "../Auth/auth.service";
import { isAuthenticated } from "../../middleware/auth.middleware";
import { UserRoles } from "../User/users.interface";
import stockService from "./stock.service";
import { addStockSchema , updateStockSchema} from "./stock.validation";



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

const stockRouter : Router =  Router();
stockRouter.get('/',isAuthenticated([UserRoles.MANAGER]),stockService.getAllStocks);
stockRouter.get('/:id',isAuthenticated([UserRoles.MANAGER]),stockService.getStockById);
stockRouter.post('/',isAuthenticated([UserRoles.MANAGER]),validate(addStockSchema),stockService.addStock);
stockRouter.put('/:id',isAuthenticated([UserRoles.MANAGER]),validate(updateStockSchema),stockService.updateStock);
stockRouter.delete('/:id',isAuthenticated([UserRoles.MANAGER]),stockService.deleteStock);   


export default stockRouter ;    