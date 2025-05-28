import { z } from "zod";

export const MONGODBObjectId = /^[0-9a-fA-F]{24}$/;

export const validateMongoDBId = (id: string) => {
    return MONGODBObjectId.test(id);
}

export interface IDBModel extends Document {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export const params = z.object({
    id: z.string().refine(validateMongoDBId, { message: "Invalid MongoDB ID" })
})


