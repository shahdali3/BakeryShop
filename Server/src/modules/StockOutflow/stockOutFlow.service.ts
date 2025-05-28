import { NextFunction, Request, Response } from "express"
import expressAsyncHandler from "express-async-handler"
import { addStockOutFlowSchema, updateStockOutFlowSchema } from "./stockOutFlow.validation";
import stockOutflowSchema from "./stockOutflow.schema";
import ApiError from "../../utils/apiErrors";
import { z } from "zod";
import { IStockOutflow } from "./stockOutflow.interface";
import { Order } from "../Order";






class StockOutFlowService {



    // addStockOutFlow : any = expressAsyncHandler(
    // async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    //     try {

    //         const validationData = addStockOutFlowSchema.parse(req.body);

    //         const stockOutFlow : IStockOutflow = await stockOutflowSchema.create(validationData);

    //         if (!stockOutFlow) {
    //             return next(new ApiError(`${req.__('not_found')}`, 404));
    //         }

    //         res.status(201).json({ message: "Stock outflow added successfully", data: stockOutFlow });
    //     }
    //     catch (error) {
    //         if (error instanceof z.ZodError) {
    //             return next(new ApiError(error.errors.map((err) => err.message).join(', '), 400));
    //         }
    //         return next(error);
    //     }
    // })


    getStockOutFlowByOrder : any = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {


        const orderId = req.params.id;
        const stockOutFlow : IStockOutflow | null = await Order.findOne({ orderId });

        if (!stockOutFlow) {
            return next(new ApiError(`${req.__('not_found')}`, 404));
        }
        res.status(200).json({ message: "Stock outflow fetched successfully", data: stockOutFlow });

    })

    updateStockOutFlow : any = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {


        try {

            const validationData = updateStockOutFlowSchema.parse(req.body);

            const stockOutFlow : IStockOutflow | null = await stockOutflowSchema.findByIdAndUpdate(
                req.params.id, validationData, { new: true });

            if (!stockOutFlow) {
                return next(new ApiError(`${req.__('not_found')}`, 404));
            }

            res.status(200).json({ message: "Stock outflow updated successfully", data: stockOutFlow });

        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return next(new ApiError(error.errors.map((err) => err.message).join(', '), 400));
            }
            return next(error);
        }
    })

    deleteStockOutFlow : any = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {


        const stockOutFlow : IStockOutflow | null = await stockOutflowSchema.findByIdAndDelete(req.params.id);

        if (!stockOutFlow) {
            return next(new ApiError(`${req.__('not_found')}`, 404));
        }
        res.status(200).json({ message: "Stock outflow deleted successfully", data: stockOutFlow });
    })
}

const stockOutflowService = new StockOutFlowService()
export default stockOutflowService