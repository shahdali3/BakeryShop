import mongoose from "mongoose";
import { IStockOutflow } from "./stockOutflow.interface";





const stockOutFlowSchema = new mongoose.Schema({
    


    stockItemId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Stock',
        required : true
    },
    orderId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Order',
        required : true
    },

    quantityUsed : {
        type : Number,
        required : true,
        min : 0.01
    },
    date : {
        type : Date,
        default : Date.now
    }

},{timestamps : true})


export default mongoose.model<IStockOutflow>('StockOutflow', stockOutFlowSchema);