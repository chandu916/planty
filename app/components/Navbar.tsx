"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Heart, LayoutDashboard, Leaf, LogIn, LogOut, Package, Search, ShoppingCart, TicketPercent, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useCartStore } from "@/lib/cartStore";
import { useUserStore } from "@/lib/userStore";
import { plantCategories, searchPlantCatalog } from "@/lib/plants";
import { useRouter } from "next/navigation";

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
const emptySubscribe = () => () => {};

const NAV_LINKS = [
  { label: "Plants", href: "/#plants" },
  { label: "About", href: "/about" },
] as const;

const CATEGORY_MENU_ITEMS = [
  {
    label: "Seed Growing",
    href: "/search?q=seed%20growing",
    emoji: "🌱",
    description: "Starter trays, young greens, and fresh plant beginnings.",
  },
  {
    label: "Grafting",
    href: "/search?q=grafting",
    emoji: "✂️",
    description: "Curated plants and picks for stronger, healthier propagation.",
  },
  {
    label: "Bonsai Collection",
    href: "/plants/bonsai",
    emoji: "🌳",
    description: "Miniature trees shaped with patience and long-form care.",
  },
  {
    label: "Flowering Plants",
    href: "/plants/flowering",
    emoji: "🌸",
    description: "Bloom-rich plants for color, fragrance, and soft texture.",
  },
  {
    label: "Indoor Greens",
    href: "/plants/indoor",
    emoji: "🌿",
    description: "Lush foliage picks that thrive inside modern living spaces.",
  },
  {
    label: "Herbs & Edibles",
    href: "/plants/herbs",
    emoji: "🌿",
    description: "Kitchen-ready herbs and aromatic edible plant favorites.",
  },
] as const;

const PROFILE_OPTIONS = [
  { label: "My Profile", href: "/profile", icon: UserCircle2, accent: "text-green-200" },
  { label: "Orders", href: "/profile/orders", icon: Package, accent: "text-sky-200" },
  { label: "Coupons", href: "/profile/coupons", icon: TicketPercent, accent: "text-amber-200" },
  { label: "Wishlist", href: "/profile/wishlist", icon: Heart, accent: "text-rose-200" },
];

const SEARCH_TABS = [
  { id: "all", label: "All" },
  ...plantCategories.slice(0, 5).map((category) => ({
    id: category.id,
    label: `${category.emoji} ${category.name}`,
  })),
] as const;

export default function Navbar() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const router = useRouter();

  // Only read Zustand stores after hydration to avoid SSR mismatch
  const totalQty = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchTab, setSearchTab] = useState<(typeof SEARCH_TABS)[number]["id"]>("all");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const searchMatches = useMemo(() => {
    const base = deferredSearchQuery.trim()
      ? searchPlantCatalog(deferredSearchQuery)
      : plantCategories.flatMap((category) =>
          category.plants.slice(0, 2).map((plant) => ({
            ...plant,
            categoryId: category.id,
            categoryName: category.name,
            categoryEmoji: category.emoji,
            categoryDescription: category.description,
            gradient: category.gradient,
          })),
        );

    const filtered = searchTab === "all"
      ? base
      : base.filter((plant) => plant.categoryId === searchTab);

    return filtered.slice(0, 6);
  }, [deferredSearchQuery, searchTab]);

  const highlightedSuggestionIndex =
    activeSuggestionIndex >= 0 && activeSuggestionIndex < searchMatches.length
      ? activeSuggestionIndex
      : -1;

  const clearServerSession = () => {
    void fetch("/api/auth/session", { method: "POST", credentials: "include" }).catch(() => undefined);
  };

  useEffect(() => {
    if (!mounted || !isLoggedIn) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetInactivityTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        clearServerSession();
        logout();
        router.push("/login");
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => window.addEventListener(event, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
    };
  }, [mounted, isLoggedIn, logout, router]);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    clearServerSession();
    logout();
    router.push("/");
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setSearchOpen(false);
    setActiveSuggestionIndex(-1);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSuggestedSearch = (value: string, tabId?: (typeof SEARCH_TABS)[number]["id"]) => {
    setSearchQuery(value);
    setSearchOpen(false);
    setActiveSuggestionIndex(-1);
    if (tabId) {
      setSearchTab(tabId);
    }
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchOpen || searchMatches.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((current) => (current + 1) % searchMatches.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((current) => (current <= 0 ? searchMatches.length - 1 : current - 1));
      return;
    }

    if (event.key === "Enter" && activeSuggestionIndex >= 0) {
      event.preventDefault();
      const selectedPlant = searchMatches[highlightedSuggestionIndex];
      handleSuggestedSearch(selectedPlant.name, selectedPlant.categoryId);
      return;
    }

    if (event.key === "Escape") {
      setSearchOpen(false);
      setActiveSuggestionIndex(-1);
    }
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed left-0 right-0 top-0 z-50 bg-transparent px-4 py-4 sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 rounded-[28px] border border-white/10 bg-black/30 px-3 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-4">
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <motion.div
            whileHover={{ rotate: 20, scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-green-400"
          >
            <Leaf size={26} />
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Plan<span className="text-green-400">ty</span>
          </span>
        </Link>

        <div className="ml-2 hidden shrink-0 items-center gap-5 xl:flex">
          <div
            className="relative"
            onMouseEnter={() => setCategoriesMenuOpen(true)}
            onMouseLeave={() => setCategoriesMenuOpen(false)}
          >
            <motion.button
              type="button"
              onClick={() => setCategoriesMenuOpen((open) => !open)}
              whileHover={{ color: "#86efac", y: -2 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-green-100/80 transition-colors hover:text-green-300"
              aria-expanded={categoriesMenuOpen}
              aria-haspopup="menu"
            >
              Categories
              <ChevronDown size={15} className={`transition ${categoriesMenuOpen ? "rotate-180" : ""}`} />
            </motion.button>

            <AnimatePresence>
              {categoriesMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 top-[calc(100%+14px)] z-50 w-[22rem] overflow-hidden rounded-[28px] border border-white/10 bg-[#07110d]/95 p-2 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl"
                >
                  <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-green-200/35">
                    Plant Categories
                  </div>
                  <div className="space-y-1">
                    {CATEGORY_MENU_ITEMS.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setCategoriesMenuOpen(false)}
                        className="flex items-start gap-3 rounded-[22px] px-3 py-3 transition hover:bg-white/5"
                      >
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-lg">
                          {item.emoji}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-white">{item.label}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-green-100/45">{item.description}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {NAV_LINKS.map((item) => (
            <Link key={item.label} href={item.href}>
              <motion.span
                whileHover={{ color: "#86efac", y: -2 }}
                className="block text-sm font-medium text-green-100/75 transition-colors hover:text-green-300"
              >
                {item.label}
              </motion.span>
            </Link>
          ))}
        </div>

        <div className="hidden min-w-0 flex-1 md:block xl:mx-3">
          <div className="relative mx-auto max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="flex items-stretch" onFocus={() => setSearchOpen(true)}>
              <div className="relative min-w-0 flex-1">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-green-200/45" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setActiveSuggestionIndex(-1);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  onBlur={() => window.setTimeout(() => {
                    setSearchOpen(false);
                    setActiveSuggestionIndex(-1);
                  }, 140)}
                  placeholder="Search rare bonsai, indoor greens, herbs..."
                  className="w-full rounded-l-full rounded-r-none border border-r-0 border-white/10 bg-white/[0.06] py-3 pl-11 pr-4 text-sm text-white placeholder:text-green-100/30 focus:border-green-400/35 focus:outline-none focus:ring-2 focus:ring-green-400/20"
                />
              </div>
              <button
                type="submit"
                aria-label="Search plants"
                className="unstyled-action flex h-auto shrink-0 items-center justify-center rounded-l-none rounded-r-full border border-white/10 bg-green-400 px-4 text-black transition hover:bg-green-300"
              >
                <Search size={15} />
              </button>
            </form>

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 right-0 top-[calc(100%+12px)] overflow-hidden rounded-[24px] border border-white/10 bg-[#07120d]/95 p-2 shadow-[0_24px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl"
                >
                  <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-green-200/35">Suggested</div>
                  <div className="scrollbar-none flex gap-2 overflow-x-auto px-2 pb-3">
                    {SEARCH_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setSearchTab(tab.id);
                          setActiveSuggestionIndex(-1);
                        }}
                        className={`unstyled-action shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          searchTab === tab.id
                            ? "border-green-400/35 bg-green-500/18 text-white"
                            : "border-white/10 bg-white/[0.04] text-green-100/55 hover:border-green-400/20 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {searchMatches.length === 0 ? (
                    <div className="rounded-2xl px-4 py-5 text-sm text-green-100/45">
                      No suggestions in this tab yet. Try another plant name or category.
                    </div>
                  ) : (
                    searchMatches.map((plant) => (
                      <button
                        key={`${plant.categoryId}-${plant.id}`}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSuggestedSearch(plant.name, plant.categoryId)}
                        className={`unstyled-action flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-white/5 ${
                          searchMatches[highlightedSuggestionIndex]?.id === plant.id ? "bg-white/8" : ""
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-white">{plant.categoryEmoji} {plant.name}</span>
                          <span className="block truncate text-xs text-green-100/45">{plant.categoryName} · {plant.care}</span>
                        </span>
                        <span className="ml-4 text-sm font-semibold text-green-300">₹{plant.price}</span>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href="/search">
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              title="Search Plants"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-green-300/80 transition hover:border-green-400/35 hover:text-white md:hidden"
            >
              <Search size={17} />
            </motion.div>
          </Link>

          <Link href="/admin">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Admin Dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-green-500/25 text-green-400 transition-all hover:border-green-400 hover:text-green-300"
            >
              <LayoutDashboard size={18} />
            </motion.div>
          </Link>

          <Link href="/cart">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-green-500/25 text-green-400 transition-all hover:border-green-400 hover:text-green-300"
            >
              <ShoppingCart size={18} />
              {mounted && totalQty > 0 && (
                <AnimatePresence>
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-black"
                  >
                    {totalQty > 9 ? "9+" : totalQty}
                  </motion.span>
                </AnimatePresence>
              )}
            </motion.div>
          </Link>

        {mounted ? (
          isLoggedIn ? (
            <div
              className="relative"
              onMouseEnter={() => setProfileMenuOpen(true)}
              onMouseLeave={() => setProfileMenuOpen(false)}
            >
              <motion.button
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-full border border-green-500/25 bg-white/[0.04] px-3 py-2 text-sm text-green-100 transition hover:border-green-400/35 hover:text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-sm font-bold text-black">
                  {user?.fullName?.[0]?.toUpperCase() ?? "P"}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-[11px] uppercase tracking-[0.22em] text-green-100/40">Account</span>
                  <span className="block max-w-28 truncate font-medium">{user?.fullName ?? "My Profile"}</span>
                </span>
                <ChevronDown size={15} className={`transition ${profileMenuOpen ? "rotate-180" : ""}`} />
              </motion.button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-[calc(100%+12px)] z-50 w-72 overflow-hidden rounded-[26px] border border-white/10 bg-[#07110d]/95 p-2 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl"
                  >
                    <div className="rounded-[20px] border border-white/8 bg-white/[0.035] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-green-100/35">Signed In</p>
                      <p className="mt-1 truncate text-sm font-semibold text-white">{user?.fullName}</p>
                      <p className="truncate text-xs text-green-100/45">{user?.email}</p>
                    </div>

                    <div className="mt-2 space-y-1">
                      {PROFILE_OPTIONS.map(({ label, href, icon: Icon, accent }) => (
                        <Link key={href} href={href}>
                          <span className="flex items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-white/5">
                            <span className={accent}>
                              <Icon size={16} />
                            </span>
                            <span className="text-sm font-medium text-white">{label}</span>
                          </span>
                        </Link>
                      ))}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-red-500/10"
                      >
                        <span className="text-red-300">
                          <LogOut size={16} />
                        </span>
                        <span className="text-sm font-medium text-red-200">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login">
              <motion.div
                data-bubble="true"
                data-sound="auth"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500 hover:bg-green-400 text-black font-semibold text-sm transition-colors shadow-lg shadow-green-500/30"
              >
                <LogIn size={15} />
                Login
              </motion.div>
            </Link>
          )
        ) : (
          <div className="w-20 h-9" />
        )}
        </div>
      </div>
    </motion.nav>
  );
}
