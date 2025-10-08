
export interface PpeItem {
  name: string;
  unit: string;
  quantity: number;
}

export interface Profession {
  name: string;
  items: PpeItem[];
}

export interface SelectedProfession {
  id: string;
  name: string;
  count: number;
}

export interface TotalPpeItem {
  unit: string;
  totalQuantity: number;
}

export type PpeTotals = Record<string, TotalPpeItem>;
