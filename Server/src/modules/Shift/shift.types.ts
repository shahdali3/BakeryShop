import { IDBModel } from "../../utils/general";
import { Users } from "../User/users.interface";

export interface IShift extends IDBModel {
    cashierId: string;
    
    startBalance: number;
    endBalance: number;

    allOrdersCount: number;
    notPaidOrdersCount: number;

    paymentWithCash: number;
    paymentWithVisa: number;

    soldItemsCount: number;

    cancelledAt?: string;
    isCancelled: boolean;
    
    cashierData: Users;

}

export interface IStartShift {
    cashierId: string;
    startBalance: number;
}

export interface IEndShift {
    cashierId: string;
    endBalance: number;
}