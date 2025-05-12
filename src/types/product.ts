
export type ProductVariation = {
  id: string;
  name: string;
  price: number;
  selected?: boolean;
};

export type ProductOption = {
  id: string;
  title: string;
  required: boolean;
  maxOptions?: number;
  variations: ProductVariation[];
};
