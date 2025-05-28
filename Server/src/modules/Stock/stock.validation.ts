import { z } from "zod";

export const addStockSchema = z.object({

    name : z.string().min(3).max(100),
    quantity: z.number().positive(),
    pricePerUnit: z.number().positive(),
    category: z.enum(['breakfast', 'lunch', 'dinner', 'drinks','snacks','others']),
    unit: z.string().min(1).default('0'),
    managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid manager id'),
    date: z.string().datetime().optional()

})

export const updateStockSchema = z.object({

    name : z.string().min(3).max(100).optional(),
    quantity: z.number().positive().optional(),
    pricePerUnit: z.number().positive().optional(),
    category: z.enum(['breakfast', 'lunch', 'dinner', 'drinks','snacks','others']).optional(),
    unit: z.string().min(1).default('0').optional(),
    managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid manager id').optional(),
})

export const deleteStockSchema = z.object({
    managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid manager id')
})

export const getStockSchema = z.object({
    managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid manager id')
})

