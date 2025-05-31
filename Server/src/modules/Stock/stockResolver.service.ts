import stockSchema from "./stock.schema";
import ApiError from "../../utils/apiErrors";


export const resolveStockItems = async(ingredients: Array<{

    stockName : string;
    quantityUsed : number;
    unit : string;
}>) : Promise<Array<{

    stockItemId : string;
    stockName : string;
    quantityUsed : number;
    unit : string;
}>> => {
    
    return Promise.all(ingredients.map(async(ing) => {

        const stockItem = await stockSchema.findOne({ 
            name : ing.stockName,
            quantity : { $gt : 0 }
        }).sort({createdAt : -1});

        if(!stockItem) {
            throw new ApiError(`No available stock found for${ing.stockName}`, 404);
        }
        return {
            stockItemId : stockItem._id.toString(),
            stockName : stockItem.name,
            quantityUsed : ing.quantityUsed,
            unit : ing.unit || stockItem.unit
        };
    }));
}