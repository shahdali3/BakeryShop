import { FilterQuery, Model, UpdateQuery } from "mongoose";
import { Order } from "./order.schema";
import { IOrder } from "./order.types";
import { ResultWithContextImpl } from "express-validator/lib/chain";

class OrderRepository<T = IOrder> {

    constructor(private orderModel: Model<T>) {}

    async createOne(data: Partial<T>): Promise<T | null> {
        const order = await this.orderModel.create(data);
        return await this.findOne({ _id: order._id })
    }

    async updateOne(query: FilterQuery<T>, data: UpdateQuery<T>): Promise<T | null> {
        return  this.orderModel.findByIdAndUpdate(query, data, { new: true }).populate([
            { path: 'orderItemsData' }
        ]);
    }

    async findOne(query: FilterQuery<T>): Promise<T | null> {
        return this.orderModel.findOne(query).populate([
            { path: 'orderItemsData' }
        ]);
    }

    async findMany(query: FilterQuery<T>, { limit, skip }: { limit: number, skip: number }): Promise<T[]> {
        return this.orderModel.find(query).limit(limit).skip(skip).populate([
            { path: 'orderItemsData' }
        ]);
    }

    async deleteOne(query: FilterQuery<T>): Promise<boolean> {
        const result = await this.orderModel.deleteOne(query).populate([
            { path: 'orderItemsData' }
        ]);
        return result.deletedCount > 0;
    }
}

export const orderRepository = new OrderRepository(Order);

