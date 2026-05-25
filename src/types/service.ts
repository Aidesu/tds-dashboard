export interface Service {
  id: string;
  name: string;
  url: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export type ServiceCategory =
  | "Développement"
  | "Design"
  | "Productivité"
  | "Médias"
  | "Communication"
  | "Finance"
  | "Autre";

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Développement",
  "Design",
  "Productivité",
  "Médias",
  "Communication",
  "Finance",
  "Autre",
];

export const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  "Développement": "#4ade80",
  "Design":        "#e8547a",
  "Productivité":  "#60a5fa",
  "Médias":        "#a78bfa",
  "Communication": "#fb923c",
  "Finance":       "#fbbf24",
  "Autre":         "#94a3b8",
};
