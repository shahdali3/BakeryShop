import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import { Stock } from "./stock.interface";
import ApiError from "../../utils/apiErrors";
import { z } from "zod";
import stockSchema from "./stock.schema";
import { addStockSchema , updateStockSchema } from "./stock.validation";



class StockService {


    addStock : any = expressAsyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try{
                const validatedData = addStockSchema.parse(req.body);

                const stock: Stock  = await stockSchema.create(validatedData);

        if(!stock) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(201).json({message:"Stock created successfully",data: stock});
       }
       catch(error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(error.errors.map((err) => err.message).join(', '), 400));
        }
        return next(error);
        }
    }
)

    getStockById : any = expressAsyncHandler(async(req: Request,res: Response, next: NextFunction): Promise<void> =>{


        const stock : Stock | null = await stockSchema.findById(req.params.id);

        if(!stock) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(200).json({message:"Stock fetched successfully",data: stock});
    })

    getAllStocks : any = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        const stocks : Stock [] = await stockSchema.find();

        if(!stocks) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(200).json({message:"Stocks fetched successfully",data: stocks});
        
    })

    updateStock : any = expressAsyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {

            try{

            
        const validatedData = updateStockSchema.parse(req.body);
        const stock : Stock | null = await stockSchema.findByIdAndUpdate(
            req.params.id,
            validatedData,
             {new: true});

        if(!stock) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(200).json({message:"Stock updated successfully",data: stock});
    }
    catch(error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(error.errors.map((err) => err.message).join(', '), 400));
        }
        return next(error);
    }
   
    })

    deleteStock : any = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {


        const stock : Stock | null = await stockSchema.findByIdAndDelete(req.params.id);

        if(!stock) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(200).json({message:"Stock deleted successfully",data: stock});
    })


}

const stockService = new StockService();

export default stockService