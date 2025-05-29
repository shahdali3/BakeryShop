import mongoose from "mongoose";



const stockSchema = new mongoose.Schema({

    name: {
        type : String,
        required : true,
    },
    supplierName :{
        type : String,
        required : true

    },
    invoice : [

        {
        type : {
            type : String,
            required : true,
            enum : ["Cash","Postponed"]
        },
        value : {
            type : Number,
            required : true
        },
        residualValue :{
            type : Number,
            required : true,
            default : 0
        },
    },
    ],
    quantity : {
        type: Number,
        required : true,
        default : 0
    },
    pricePerUnit : {
        type : Number,
        required : true
    },
    
    unit : {
        type : String,
        required : true,
        enum : ['pcs','ml','grams','kg','liters','cans','cups','tsp','tbsp','packets','boxes'], // tsp = teaspoon للتوابل 
        default : 'pcs'
    },
    managerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Users',
        required : true
    },
    date : {
        type : Date,
        default : Date.now
    }

},{timestamps : true})

export default mongoose.model('Stock',stockSchema);