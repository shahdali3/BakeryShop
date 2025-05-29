

import { Types,Document } from "mongoose";

export interface  Stock extends Document {

    name : string ;
    quantity : number;
    pricePerUnit : number;
    unit : Unit;
    managerId : Types.ObjectId;
    date : Date;
    supplierName : string;
    invoice : Invoice[];
    
}



export interface Invoice {

    type : string;
    value : number;
    residualValue : number;
}


type Unit = 'pcs'|'ml'|'grams'|'kg'|'liters'|'cans'|'cups'|'tsp'|'tbsp'|'packets'|'boxes' ; // tsp = teaspoon للتوابل



