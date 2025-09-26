// src/types/Tree.ts
export type Tree = {
  id: string;
  common_name: string;
  scientific_name: string;
  taxonomy: {
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    species: string;
  };
  endemic: {
    region: string;
    countries: string[];
    provinces?: string[];
  };
  coordinates: {
    latitude: number;
    longitude: number;
    location: string;
  };
  description: string;
  characteristics: string[];
  created_at: string;
};