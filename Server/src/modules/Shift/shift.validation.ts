import { z } from "zod"
import { validateMongoDBId } from "../../utils/general"


export const startShiftSchema = z.object({
    startBalance: z.number().int().positive()
})

export const endShiftSchema = z.object({
    endBalance: z.number().int().positive()
})

export const getAllShiftsSchema = z.object({
    cashierId: z
    .string()
    .refine(validateMongoDBId, { message: "Invalid MongoDB ID" })
    .optional(),
    page: z.coerce.number().int().positive().default(1),
    size: z.coerce.number().int().positive().max(100).default(20),
    includeAll: z.coerce.boolean().optional().default(false),
})