import type { Metadata } from "next";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
  title: "Your Cart — Planty",
};

export default function CartPage() {
  return <CartPageClient />;
}
