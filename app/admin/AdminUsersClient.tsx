"use client";

import { motion } from "framer-motion";
import {
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download,
  Search,
  Leaf,
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";

interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
}

export default function AdminUsersClient({ users }: { users: AdminUser[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.state.toLowerCase().includes(q) ||
        u.phone.includes(q)
    );
  }, [users, query]);

  const downloadCSV = () => {
    const headers = ["ID", "Full Name", "Email", "Phone", "Address", "City", "State", "Pincode", "Registered At"];
    const rows = users.map((u) => [
      u._id,
      `"${u.fullName}"`,
      u.email,
      u.phone,
      `"${u.address}"`,
      u.city,
      u.state,
      u.pincode,
      new Date(u.createdAt).toLocaleString("en-IN"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planty-users-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-black py-10 px-4 sm:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-green-400 hover:text-green-300 transition-colors">
              <Leaf size={28} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <Users className="text-green-400" size={28} />
                Registered Users
              </h1>
              <p className="text-green-200/40 text-sm mt-0.5">
                {users.length} total registration{users.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <motion.button
            onClick={downloadCSV}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium transition-all"
          >
            <Download size={15} />
            Export CSV
          </motion.button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Total Users", value: users.length, icon: "👥" },
            {
              label: "Today",
              value: users.filter(
                (u) =>
                  new Date(u.createdAt).toDateString() === new Date().toDateString()
              ).length,
              icon: "📅",
            },
            {
              label: "Cities",
              value: new Set(users.map((u) => u.city)).size,
              icon: "🏙️",
            },
            {
              label: "States",
              value: new Set(users.map((u) => u.state)).size,
              icon: "🗺️",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 border border-white/8 rounded-2xl p-4"
            >
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-green-200/50 text-xs">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/50"
          />
          <input
            type="text"
            placeholder="Search by name, email, city, state or phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 hover:border-green-500/30 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-green-200/30 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Table / Cards */}
      <div className="max-w-7xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-green-200/40">
            No users match &quot;{query}&quot;
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-white/8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/3">
                    {["#", "Name", "Email", "Phone", "City / State", "Pincode", "Registered"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3.5 text-green-200/50 font-medium text-xs uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, i) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      className="border-b border-white/5 hover:bg-green-500/5 transition-colors group"
                    >
                      <td className="px-5 py-4 text-green-200/30 font-mono text-xs">
                        {user._id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                            {user.fullName[0].toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-green-200/70">
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} className="text-green-400/50 flex-shrink-0" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-green-200/70">
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-green-400/50 flex-shrink-0" />
                          {user.phone}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-green-200/70">
                          <MapPin size={12} className="text-green-400/50 flex-shrink-0" />
                          {user.city}, {user.state}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-green-200/50 font-mono text-xs">
                        {user.pincode}
                      </td>
                      <td className="px-5 py-4 text-green-200/40 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="flex-shrink-0" />
                          {new Date(user.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {filtered.map((user, i) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="bg-white/5 border border-white/8 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-black font-bold">
                      {user.fullName[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{user.fullName}</p>
                      <p className="text-green-200/40 text-xs">#{user._id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 text-sm">
                    <div className="flex items-center gap-2 text-green-200/60">
                      <Mail size={12} className="text-green-400/50" /> {user.email}
                    </div>
                    <div className="flex items-center gap-2 text-green-200/60">
                      <Phone size={12} className="text-green-400/50" /> {user.phone}
                    </div>
                    <div className="flex items-center gap-2 text-green-200/60">
                      <MapPin size={12} className="text-green-400/50" />
                      {user.address}, {user.city}, {user.state} — {user.pincode}
                    </div>
                    <div className="flex items-center gap-2 text-green-200/40 text-xs">
                      <Calendar size={11} />
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
