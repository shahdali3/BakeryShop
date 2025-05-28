import { IDBModel } from "../../utils/general";
import { Users } from "../User/users.interface";

export interface IPayment extends IDBModel {
    orderId: string;
    cashierId: string;
    shiftId: string;
    paymentMethods: {
        method: PaymentMethod;
        amount: number;
    }[];
    discount?: number;
    tax?: number;
    totalAmount: number;
    cashierData: Users
}

export enum PaymentMethod {
    CASH = 'cash',
    VISA = 'visa',
}

export interface ICreatePayment {
    shiftId: string;
    cashierId: string;
    orderId: string;
    discount?: number;
    tax?: number;
    paymentMethods: {
        method: PaymentMethod;
        amount: number;
    }[];
}


