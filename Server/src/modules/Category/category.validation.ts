import { z } from "zod";



export const addCategorySchema = z.object({
    
    name : z.string().min(3).max(100),
    description : z.string().min(3).max(500).optional(),
    color : z.string().max(100).optional(),
    date : z.string().datetime().optional()
})


export const getCategorySchema = z.object({
    managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid manager id')
})

export const updateCategorySchema = z.object({

    name : z.string().min(3).max(100).optional(),
    description : z.string().min(3).max(500).optional(),
    color : z.string().max(100).optional(),
    date : z.string().datetime().optional()
})

export const deleteCategorySchema = z.object({
    managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid manager id')
})