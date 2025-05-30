import { Schema, model } from "mongoose";
import { IOrder, OrderTypesEnum } from "./order.types";

const orderSchema = new Schema({
    cashierId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shiftId: {
        type: Schema.Types.ObjectId,
        ref: 'Shift',
        required: true
    },
    orderCode: {
        type: String
    },
    orderItems: [{
        mealId: {
            type: Schema.Types.ObjectId,
            ref: 'Meal',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min : 0.01
        },
        price: {
            type: Number,
            required: true
        },
        isCancelled: {
            type: Boolean,
            default: false
        },
        note: {
            type: String
        }
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: Object.values(OrderTypesEnum)
    },
    custName: {
        type: String,
        required: false
    },
    custPhone: {
        type: String,
    },
    custAddress: {
        type: String,
    }     
}, {
    timestamps : true,
    toJSON: {               
        virtuals: true,
        versionKey: false
    },
    toObject: {
        virtuals: true,
        versionKey: false
    }
})

orderSchema.pre('save', async function(next) {
    if(this.isNew) {
        let isUnique = false;
        let orderCode;
        
        // Keep generating until we find a unique code
        while (!isUnique) {
            const random = Math.floor(1000000 + Math.random() * 9000000);
            orderCode = `ORD-${random}`;
            
            // Check if this code already exists
            const existingOrder = await (this.constructor as any).findOne({ orderCode });
            
            if (!existingOrder) {
                isUnique = true;
            }
        }   
        this.orderCode = orderCode;
    }

    next();
});

orderSchema.virtual('orderItemsData', {
    ref: 'Meal',
    localField: 'orderItems.mealId',
    foreignField: '_id',
    justOne: false,
    autopopulate: true
})

orderSchema.virtual('cashierData', {
    ref: 'User',
    localField: 'cashierId',
    foreignField: '_id',
    justOne: true,
    options: {
        select: "username name"
    },
    autopopulate: true
})

export const Order = model<IOrder>('Order', orderSchema);


