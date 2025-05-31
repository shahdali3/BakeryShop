import { z } from "zod"
import { MONGODBObjectId } from "../../utils/general"
import { OrderTypesEnum } from "./order.types";

export const orderItemSchema = z.object({
    mealId: z.string().regex(MONGODBObjectId, 'invalid meal id'),
    quantity: z.number().min(0.01).default(1).optional(),
    note: z.string().optional()
})

export const createOrderSchema = z.object({
    custName: z.string().optional(),
    custPhone: z.string().optional(),
    custAddress: z.string().optional(),
    type: z.nativeEnum(OrderTypesEnum),
    orderItems: z.array(
        z.object({
            mealId : z.string().regex(MONGODBObjectId, 'invalid meal id'),
            quantity: z.number().positive().min(0.01),
            note: z.string().optional()
        })
    ),
}).refine((data) => {
    if(data.type === OrderTypesEnum.DELIVERY) {
        return !!data.custName && !!data.custAddress && !!data.custPhone;  
    }
    return true; // for takeaway orders,customer details are optional
}, {
    message: 'Customer name/address/phone is required',
})

export const addMealToOrderSchema = orderItemSchema;

export const deleteMealFromOrderSchema = z.object({
    mealId: z.string().regex(MONGODBObjectId, 'invalid meal id'),
})

export const getAllOrdersSchema = z.object({
    page: z.number().min(1).default(1),
    size: z.number().max(100).default(20),
    date: z.coerce.date().optional(),
    cashierId: z.string().regex(MONGODBObjectId, 'invalid cashier id').optional(),
    shiftId: z.string().regex(MONGODBObjectId, 'invalid shift id').optional(),
})

export const getOrderByCodeSchema = z.object({
    orderCode: z.string().regex(/^ORD-\d{7}$/, 'invalid order code'),
})
