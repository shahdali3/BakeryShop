import { FilterQuery, Model, UpdateQuery } from "mongoose";
import { Payment } from "./payment.schema";
import { IPayment } from "./payment.types";

class OrderRepository<T = IPayment> {

    constructor(private orderModel: Model<T>) {}

    async createOne(data: Partial<T>): Promise<T | null> {
        const payment = await this.orderModel.create(data);
        return await this.findOne({ _id: payment._id });
    }

    async updateOne(query: FilterQuery<T>, data: UpdateQuery<T>): Promise<T | null> {
        return  this.orderModel.findByIdAndUpdate(query, data, { new: true }).populate([
            { path: 'orderData' },
            { path: 'cashierData' }
        ]);
    }

    async findOne(query: FilterQuery<T>): Promise<T | null> {
        return this.orderModel.findById(query).populate([
            { path: 'orderData' },
            { path: 'cashierData' }
        ]);
    }

    async findMany(query: FilterQuery<T>, { limit, skip }: { limit: number, skip: number }): Promise<T[]> {
        return this.orderModel.find(query).limit(limit).skip(skip).populate([
            { path: 'orderData' },
            { path: 'cashierData' }
        ]);
    }

    async deleteOne(query: FilterQuery<T>): Promise<boolean> {
        const result = await this.orderModel.deleteOne(query);
        return result.deletedCount > 0;
    }
}

export const paymentRepository = new OrderRepository(Payment);

