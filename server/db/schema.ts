/**
 * server/db/schema.ts
 * TypeScript interfaces for every collection in PlantyDB.
 * MongoDB is schemaless, but these types enforce consistency across the codebase.
 */
import { ObjectId } from "mongodb";

// ─────────────────────────────────────────────
//  USERS COLLECTION
// ─────────────────────────────────────────────

export interface UserDocument {
  _id?: ObjectId;
  fullName: string;      // customer's full name
  email: string;         // unique — delivery contact email
  passwordHash: string;  // bcrypt hash — never expose to client
  phone: string;         // 10-digit Indian mobile
  address: string;       // street / flat / building
  city: string;
  state: string;
  pincode: string;       // 6-digit Indian postal code
  createdAt: string;     // ISO 8601 timestamp
  updatedAt: string;     // ISO 8601 timestamp (set on every profile update)
}

/** Shape returned to the client (ObjectId serialised to string) */
export interface UserDTO {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
  updatedAt: string;
}

export function toUserDTO(doc: UserDocument & { _id: ObjectId }): UserDTO {
  return {
    _id: doc._id.toString(),
    fullName: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    address: doc.address,
    city: doc.city,
    state: doc.state,
    pincode: doc.pincode,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ─────────────────────────────────────────────
//  ADMINS COLLECTION
// ─────────────────────────────────────────────

export type AdminRole = "superadmin" | "admin";

export interface AdminDocument {
  _id?: ObjectId;
  name: string;                    // display name
  email: string;                   // unique — login email
  passwordHash: string;            // bcrypt hash (never expose to client)
  role: AdminRole;                 // "superadmin" | "admin"
  isActive: boolean;               // false = account disabled
  createdAt: string;               // ISO 8601 timestamp
  lastLoginAt: string | null;      // null until first login
}

/** Safe shape returned to the client — password hash excluded */
export interface AdminDTO {
  _id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export function toAdminDTO(doc: AdminDocument & { _id: ObjectId }): AdminDTO {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    lastLoginAt: doc.lastLoginAt,
  };
}

// ─────────────────────────────────────────────
//  ORDERS COLLECTION
// ─────────────────────────────────────────────

export type OrderStatus = "pending" | "accepted" | "declined";
export type DeliveryStatus = "not_shipped" | "shipped" | "out_for_delivery" | "delivered";

export interface OrderItem {
  id: string;
  name: string;
  emoji: string;
  categoryName: string;
  price: number;
  quantity: number;
}

export interface OrderDocument {
  _id?: ObjectId;
  userEmail: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  userCity: string;
  userState: string;
  userPincode: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDTO {
  _id: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  userCity: string;
  userState: string;
  userPincode: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
}

export function toOrderDTO(doc: OrderDocument & { _id: ObjectId }): OrderDTO {
  return {
    _id: doc._id.toString(),
    userEmail: doc.userEmail,
    userName: doc.userName,
    userPhone: doc.userPhone,
    userAddress: doc.userAddress,
    userCity: doc.userCity,
    userState: doc.userState,
    userPincode: doc.userPincode,
    items: doc.items,
    subtotal: doc.subtotal,
    deliveryFee: doc.deliveryFee,
    total: doc.total,
    status: doc.status,
    deliveryStatus: (doc.deliveryStatus as DeliveryStatus) ?? "not_shipped",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ─────────────────────────────────────────────
//  CARTS COLLECTION  (one doc per user email)
// ─────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  emoji: string;
  categoryName: string;
  price: number;
  quantity: number;
}

export interface CartDocument {
  _id?: ObjectId;
  userEmail: string;         // unique key — one cart per user
  items: CartItem[];
  updatedAt: string;         // ISO 8601 — last save time
}
