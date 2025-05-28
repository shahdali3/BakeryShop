import { FilterQuery, Model, UpdateQuery } from "mongoose";
import { IShift } from "./shift.types";
import { Shift } from "./shift.schema";

class ShiftRepository<T = IShift> {

    constructor(private shiftModel: Model<T>) {}

    async createOne(data: Partial<T>): Promise<T | null> {
        const shift = await this.shiftModel.create(data);
        return await this.findOne({ _id: shift._id });
    }

    async updateOne(query: FilterQuery<T>, data: UpdateQuery<T>): Promise<T | null> {
        return await this.shiftModel.findOneAndUpdate(query, data, { new: true }).populate([
            { path: 'cashierData' }
        ]);
    }

    async findOne(query: FilterQuery<T>): Promise<T | null> {
        return this.shiftModel.findOne(query).populate([
            { path: 'cashierData' }
        ]);
    }

    async findMany(query: FilterQuery<T>, { limit, skip }: { limit: number, skip: number }): Promise<T[]> {
        return this.shiftModel.find(query).limit(limit).skip(skip).populate([
            { path: 'cashierData' }
        ]);
    }

    async deleteOne(query: FilterQuery<T>): Promise<boolean> {
        const result = await this.shiftModel.deleteOne(query);
        return result.deletedCount > 0;
    }
}

export const shiftRepository = new ShiftRepository(Shift);

