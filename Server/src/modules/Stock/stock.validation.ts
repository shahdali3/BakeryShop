import { z } from "zod";

export const addStockSchema = z.object({

    name : z.string().min(3).max(100),
    supplierName: z.string().min(3).max(100),
    quantity: z.number().positive(),
    pricePerUnit: z.number().positive(),
    managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid manager id'),
    date: z.string().datetime().optional(),
    unit: z.enum(['pcs', 'ml', 'grams', 'kg', 'liters', 'cans', 'cups', 'tsp', 'tbsp', 'packets', 'boxes']).default('pcs'),
    invoice: z.array(z.object({
        
        type: z.enum(['Cash', 'Postponed']),
        value: z.number().positive(),
        residualValue: z.number().nonnegative(), // يسمح بالقيم 0 وما فوق

    }))

})

export const updateStockSchema = z.object({

    name : z.string().min(3).max(100).optional(),
    supplierName: z.string().min(3).max(100).optional(),
    quantity: z.number().positive().optional(),
    pricePerUnit: z.number().positive().optional(),
    managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid manager id').optional(),
    date: z.string().datetime().optional(),
    unit: z.enum(['pcs', 'ml', 'grams', 'kg', 'liters', 'cans', 'cups', 'tsp', 'tbsp', 'packets', 'boxes']).optional(),
    invoice: z.array(z.object({
        
        type: z.enum(['Cash', 'Postponed']),
        value: z.number().positive(),
        residualValue: z.number().nonnegative(), // يسمح بالقيم 0 وما فوق
    })).optional()


})

export const deleteStockSchema = z.object({
    managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid manager id')
})

export const getStockSchema = z.object({
    managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid manager id')
})

