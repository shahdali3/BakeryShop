

import { Types,Document } from "mongoose";

export interface  Stock extends Document {

    name : string ;
    quantity : number;
    pricePerUnit : number;
    category : string;
    unit : string;
    managerId : Types.ObjectId;
    date : Date;
}

