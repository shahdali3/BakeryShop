import ApiError from "../../utils/apiErrors";
import { NextFunction, Request, Response } from "express";
import {z} from "zod";
import { Router } from "express";
import stockOutFlow from "./stockOutFlow.service";
import { isAuthenticated } from "../../middleware/auth.middleware";
import { addStockOutFlowSchema, getStockOutFlowSchema, updateStockOutFlowSchema } from "./stockOutFlow.validation";
import { UserRoles } from "../User/users.interface";
import stockOutflowSchema from "./stockOutflow.schema";
import stockOutFlowService from "./stockOutFlow.service";
import { updateStockSchema } from "../Stock/stock.validation";



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


const StockOutFlowRouter : Router = Router();


StockOutFlowRouter.get(
    '/:orderId',
    isAuthenticated([UserRoles.MANAGER]),
    stockOutFlowService.getStockOutFlowByOrder
    
)

// StockOutFlowRouter.post(
//     '/',
//     isAuthenticated([UserRoles.MANAGER]),
//     validate(addStockOutFlowSchema),
//     stockOutFlowService.addStockOutFlow
// )

StockOutFlowRouter.put(
    '/:id',
    isAuthenticated([UserRoles.MANAGER]),
    validate(updateStockOutFlowSchema),
    stockOutFlowService.updateStockOutFlow
)

StockOutFlowRouter.delete(
    '/:id',
    isAuthenticated([UserRoles.MANAGER]),
    stockOutFlowService.deleteStockOutFlow
)

export default StockOutFlowRouter