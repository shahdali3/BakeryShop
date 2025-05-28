import { Document } from "mongoose";





export interface IStockOutflow extends Document {
    stockItemId : string,
    orderId : string,
    quantityUsed : number,
    date : Date
}