import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPlantById, plantCatalog } from "@/lib/plants";
import PlantDetailClient from "./PlantDetailClient";

export async function generateStaticParams() {
  return plantCatalog.map((plant) => ({ id: plant.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const plant = getPlantById(id);
  return {
    title: plant ? `${plant.name} — Planty` : "Plant Details — Planty",
  };
}

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plant = getPlantById(id);
  if (!plant) {
    notFound();
  }

  return <PlantDetailClient plant={plant} />;
}