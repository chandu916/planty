import { plantCategories } from "@/lib/plants";
import { notFound } from "next/navigation";
import CategoryPageClient from "./CategoryPageClient";

export async function generateStaticParams() {
  return plantCategories.map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = plantCategories.find((c) => c.id === category);
  return {
    title: cat ? `${cat.name} — Planty` : "Plants — Planty",
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = plantCategories.find((c) => c.id === category);
  if (!cat) notFound();
  return <CategoryPageClient category={cat} />;
}
