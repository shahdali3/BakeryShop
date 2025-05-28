import { z } from "zod";





export const addStockOutFlowSchema = z.object({
    

    stockItemId : z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid stock item id'),
    orderId : z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid order id'),
    quantityUsed : z.number().positive(),
    date : z.string().datetime()
})


export const getStockOutFlowSchema = z.object({
    managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid manager id')
})

export const updateStockOutFlowSchema = z.object({

    stockItemId : z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid stock item id').optional(),
    orderId : z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid order id').optional(),
    quantityUsed : z.number().positive().optional(),
    date : z.string().datetime().optional()
})


export const deleteStockOutFlowSchema = z.object({
    managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid manager id')
})