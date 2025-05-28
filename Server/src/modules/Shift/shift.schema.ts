import mongoose, { Schema, model } from "mongoose";
import { IShift } from "./shift.types";

const shiftSchema = new Schema({
    cashierId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startBalance: {
        type: Number,
        required: true
    },
    endBalance: {
        type: Number,
    },
    allOrdersCount: {
        type: Number,
        default: 0
    },
    notPaidOrdersCount: {
        type: Number,
        default: 0
    },
    paymentWithCashBalance: {
        type: Number,
        default: 0,
    },
    paymentWithVisaBalance: {
        type: Number,
        default: 0
    },
    soldItemsCount: {
        type: Number,
        default: 0
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    cancelledAt: {
        type: Date
    }
}, {
    timestamps : true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

shiftSchema.virtual('cashierData', {
    ref: 'User',
    localField: 'cashierId',
    foreignField: '_id',
    justOne: true,
    autopopulate: true,
    options: {
        select: "name username image"
    }
})

export const Shift = model<IShift>('Shift', shiftSchema);

