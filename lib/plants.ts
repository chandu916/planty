export interface PlantCategory {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  plants: Plant[];
}

export interface Plant {
  id: string;
  name: string;
  price: number;
  description: string;
  care: string;
  badge?: string;
}

export interface PlantCatalogItem extends Plant {
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  categoryDescription: string;
  gradient: string;
}

export const plantCategories: PlantCategory[] = [
  {
    id: "bonsai",
    name: "Bonsai",
    description:
      "Ancient art of cultivating miniature trees. Each bonsai is a living sculpture shaped over years.",
    emoji: "🌳",
    gradient: "from-emerald-900 via-green-800 to-teal-700",
    plants: [
      {
        id: "b1",
        name: "Ficus Bonsai",
        price: 1499,
        description: "Classic indoor bonsai with glossy leaves",
        care: "Indirect light · Water twice weekly",
        badge: "Bestseller",
      },
      {
        id: "b2",
        name: "Juniper Bonsai",
        price: 1999,
        description: "Traditional evergreen with twisted trunk",
        care: "Full sun · Water daily",
      },
      {
        id: "b3",
        name: "Money Tree Bonsai",
        price: 2499,
        description: "Braided trunk, symbol of prosperity",
        care: "Indirect light · Water weekly",
        badge: "Lucky",
      },
    ],
  },
  {
    id: "flowering",
    name: "Flowering Plants",
    description:
      "Vibrant blooms to brighten every corner of your home and garden with colour and fragrance.",
    emoji: "🌸",
    gradient: "from-rose-900 via-pink-800 to-fuchsia-700",
    plants: [
      {
        id: "f1",
        name: "Peace Lily",
        price: 599,
        description: "Elegant white blooms, excellent air purifier",
        care: "Low light · Water weekly",
        badge: "Air Purifier",
      },
      {
        id: "f2",
        name: "Anthurium",
        price: 799,
        description: "Waxy heart-shaped red flowers",
        care: "Bright indirect light · Water bi-weekly",
      },
      {
        id: "f3",
        name: "Hibiscus",
        price: 499,
        description: "Large tropical blooms in vivid colours",
        care: "Full sun · Water daily",
        badge: "Tropical",
      },
    ],
  },
  {
    id: "water",
    name: "Water Plants",
    description:
      "Aquatic beauties that thrive in ponds, bowls, and water features. Nature's floating art.",
    emoji: "🪷",
    gradient: "from-cyan-900 via-teal-800 to-blue-700",
    plants: [
      {
        id: "w1",
        name: "Lotus",
        price: 899,
        description: "Sacred blooms that rise above murky water",
        care: "Full sun · Standing water",
        badge: "Sacred",
      },
      {
        id: "w2",
        name: "Water Hyacinth",
        price: 399,
        description: "Floating purple blooms, natural water filter",
        care: "Full sun · Floating in water",
      },
      {
        id: "w3",
        name: "Lucky Bamboo",
        price: 349,
        description: "Grows beautifully in water, brings good luck",
        care: "Indirect light · Change water monthly",
        badge: "Lucky",
      },
    ],
  },
  {
    id: "succulents",
    name: "Succulents & Cacti",
    description:
      "Low-maintenance desert wonders with stunning shapes. Perfect for busy plant lovers.",
    emoji: "🌵",
    gradient: "from-lime-900 via-green-700 to-emerald-600",
    plants: [
      {
        id: "s1",
        name: "Aloe Vera",
        price: 299,
        description: "Healing gel, gorgeous rosette form",
        care: "Bright light · Water monthly",
        badge: "Medicinal",
      },
      {
        id: "s2",
        name: "Echeveria",
        price: 199,
        description: "Rosette succulent in pastel hues",
        care: "Bright light · Water bi-monthly",
      },
      {
        id: "s3",
        name: "Golden Barrel Cactus",
        price: 449,
        description: "Dramatic spherical cactus with golden spines",
        care: "Full sun · Water monthly",
      },
    ],
  },
  {
    id: "indoor",
    name: "Indoor Greens",
    description:
      "Lush foliage plants that transform any interior into a tropical paradise.",
    emoji: "🌿",
    gradient: "from-green-900 via-emerald-800 to-teal-800",
    plants: [
      {
        id: "i1",
        name: "Monstera Deliciosa",
        price: 899,
        description: "Iconic split leaves, the it-plant of interiors",
        care: "Indirect light · Water weekly",
        badge: "Popular",
      },
      {
        id: "i2",
        name: "Pothos",
        price: 199,
        description: "Trailing vines, nearly impossible to kill",
        care: "Any light · Water bi-weekly",
        badge: "Beginner Friendly",
      },
      {
        id: "i3",
        name: "Snake Plant",
        price: 349,
        description: "Architectural upright form, nighttime oxygen",
        care: "Any light · Water monthly",
        badge: "Air Purifier",
      },
    ],
  },
  {
    id: "herbs",
    name: "Herbs & Edibles",
    description:
      "Grow your own flavours. Fresh herbs and edibles straight from your windowsill to your plate.",
    emoji: "🌱",
    gradient: "from-yellow-900 via-lime-800 to-green-700",
    plants: [
      {
        id: "h1",
        name: "Tulsi (Holy Basil)",
        price: 149,
        description: "Sacred herb with medicinal properties",
        care: "Full sun · Water daily",
        badge: "Medicinal",
      },
      {
        id: "h2",
        name: "Mint",
        price: 99,
        description: "Refreshing aroma, great for teas & cooking",
        care: "Partial sun · Keep moist",
      },
      {
        id: "h3",
        name: "Curry Leaf Plant",
        price: 199,
        description: "Essential Indian kitchen herb",
        care: "Full sun · Water bi-weekly",
        badge: "Edible",
      },
    ],
  },
];

export const plantCatalog: PlantCatalogItem[] = plantCategories.flatMap((category) =>
  category.plants.map((plant) => ({
    ...plant,
    categoryId: category.id,
    categoryName: category.name,
    categoryEmoji: category.emoji,
    categoryDescription: category.description,
    gradient: category.gradient,
  })),
);

function scorePlantMatch(plant: PlantCatalogItem, terms: string[]) {
  const haystack = [
    plant.name,
    plant.description,
    plant.care,
    plant.badge ?? "",
    plant.categoryName,
    plant.categoryDescription,
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const term of terms) {
    if (plant.name.toLowerCase().includes(term)) score += 5;
    if (plant.categoryName.toLowerCase().includes(term)) score += 3;
    if (haystack.includes(term)) score += 1;
  }

  return score;
}

export function searchPlantCatalog(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return plantCatalog;
  }

  const terms = normalized.split(/\s+/).filter(Boolean);

  return plantCatalog
    .filter((plant) => terms.every((term) => scorePlantMatch(plant, [term]) > 0))
    .sort((first, second) => {
      const scoreDelta = scorePlantMatch(second, terms) - scorePlantMatch(first, terms);
      if (scoreDelta !== 0) return scoreDelta;
      return first.price - second.price;
    });
}

export function getPlantById(id: string) {
  return plantCatalog.find((plant) => plant.id === id) ?? null;
}
