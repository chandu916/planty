import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
}

export type NewUser = Omit<User, "_id">;
