"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  fallbackHref?: string;
  label?: string;
  className?: string;
};

export default function BackButton({
  fallbackHref = "/",
  label = "Back",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window === "undefined") {
      router.push(fallbackHref);
      return;
    }

    const hasInternalHistory =
      window.history.length > 1 &&
      !!document.referrer &&
      document.referrer.startsWith(window.location.origin);

    if (hasInternalHistory) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={[
        "inline-flex items-center gap-2 rounded-full border border-green-400/30",
        "px-4 py-2 text-sm text-green-200/80 transition",
        "hover:border-green-300/50 hover:text-white",
        className,
      ].join(" ")}
    >
      <ArrowLeft size={14} />
      {label}
    </button>
  );
}