"use client";

import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BackButton from "@/app/components/BackButton";
import PlantCard from "@/app/components/PlantCard";
import { plantCatalog, plantCategories, searchPlantCatalog } from "@/lib/plants";

const SEARCH_TABS = [
  { id: "all", label: "All Plants" },
  ...plantCategories.slice(0, 6).map((category) => ({
    id: category.id,
    label: `${category.emoji} ${category.name}`,
  })),
] as const;

export default function SearchPageClient({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<(typeof SEARCH_TABS)[number]["id"]>("all");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const results = useMemo(() => {
    const normalized = deferredQuery.trim();
    const base = normalized ? searchPlantCatalog(normalized) : plantCatalog.slice(0, 12);

    return activeTab === "all"
      ? base
      : base.filter((plant) => plant.categoryId === activeTab);
  }, [activeTab, deferredQuery]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = query.trim();
    router.replace(normalized ? `/search?q=${encodeURIComponent(normalized)}` : "/search");
  };

  return (
    <main className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <div className="flex-1 px-4 pb-16 pt-28 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <BackButton fallbackHref="/" label="Back" className="mb-5" />

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.045] px-5 py-6 shadow-[0_24px_100px_rgba(0,0,0,0.28)] sm:px-6 sm:py-7"
          >
            <div className="pointer-events-none absolute inset-0" />
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-300/60">Plant Search</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Find the right plant faster</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-green-100/55 sm:text-base">
              Search across indoor greens, bonsai, flowering plants, succulents, herbs, and more.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-0">
              <div className="relative min-w-0 flex-1">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-green-200/40" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search Monstera, bonsai, aloe, tulsi..."
                  className="w-full rounded-full border border-white/10 bg-black/20 py-3 pl-12 pr-4 text-sm text-white placeholder:text-green-100/30 focus:border-green-400/30 focus:outline-none focus:ring-2 focus:ring-green-400/20 sm:rounded-l-full sm:rounded-r-none sm:border-r-0"
                />
              </div>
              <button
                type="submit"
                aria-label="Search plants"
                className="unstyled-action flex h-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-green-400 px-5 text-black transition hover:bg-green-300 sm:h-auto sm:rounded-l-none sm:rounded-r-full"
              >
                <Search size={15} />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {SEARCH_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== "all") {
                      const category = plantCategories.find((entry) => entry.id === tab.id);
                      if (!query.trim() && category) {
                        setQuery(category.name);
                        router.replace(`/search?q=${encodeURIComponent(category.name)}`);
                      }
                    }
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    activeTab === tab.id
                      ? "border-green-400/30 bg-green-500/15 text-white"
                      : "border-white/10 bg-white/[0.05] text-green-100/60 hover:border-green-400/25 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.section>

          <div className="mt-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-100/35">Results</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {deferredQuery.trim() ? `${results.length} matches for “${deferredQuery.trim()}”` : "Popular picks for your next corner"}
              </h2>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-green-100/55 md:inline-flex">
              <Sparkles size={15} className="text-green-300" />
              Live search across available plants
            </div>
          </div>

          {results.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.045] px-6 py-14 text-center">
              <p className="text-xl font-semibold text-white">No plants matched that search</p>
              <p className="mt-2 text-sm text-green-100/45">Try a plant name, category, or care keyword like “low light” or “air purifier”.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {results.map((plant, index) => (
                <PlantCard
                  key={`${plant.categoryId}-${plant.id}`}
                  plant={plant}
                  categoryId={plant.categoryId}
                  categoryName={plant.categoryName}
                  categoryEmoji={plant.categoryEmoji}
                  delay={index * 0.04}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer minimal />
    </main>
  );
}