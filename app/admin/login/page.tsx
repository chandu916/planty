import type { Metadata } from "next";
import AdminLoginClient from "./AdminLoginClient";

export const metadata: Metadata = {
  title: "Admin Login · Planty",
};

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}
