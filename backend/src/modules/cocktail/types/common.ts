export enum OwnerType {
  PLATFORM = "platform",
  CLIENT = "client",
}

export enum SweetnessLevel {
  DRY = "dry",
  OFF_DRY = "off_dry",
  MEDIUM_DRY = "medium_dry",
  MEDIUM = "medium",
  MEDIUM_SWEET = "medium_sweet",
  SWEET = "sweet",
}

export enum StrengthLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERY_HIGH = "very_high",
}

export enum MeasurementUnit {
  ML = "ml",
  OZ = "oz",
  CL = "cl",
  DASH = "dash",
  SPLASH = "splash",
  GARNISH = "garnish",
}

export interface CocktailDTO {
  id: string;
  name: string;
  description?: string;
  instructions: string;
  abv?: number;
  calories?: number;
  is_alcohol_free: boolean;
  sweetness_level?: SweetnessLevel;
  strength_level?: StrengthLevel;
  owner_type: OwnerType;
  owner_id?: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IngredientDTO {
  id: string;
  name: string;
  category_id?: string;
  description?: string;
  abv?: number;
  cost_per_unit?: number;
  owner_type: OwnerType;
  owner_id?: string;
  is_shared: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CocktailIngredientDTO {
  id: string;
  cocktail_id: string;
  ingredient_id: string;
  quantity: number;
  unit: MeasurementUnit;
  notes?: string;
}
