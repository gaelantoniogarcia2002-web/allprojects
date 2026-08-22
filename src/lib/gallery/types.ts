export type TileRect = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type GalleryParams = {
  categoriaId?: number;
  contactoId?: number;
  comparisonMode: boolean;
  seleccion: number[];
};

export type GalleryTile = {
  id: number;
  titulo: string;
  estado: string;
  rect: TileRect;
  percent: number;
  isOverBudget: boolean;
  tintColor: string;
  solidColor: string;
  categoriaNombre: string;
  tiempoEstimadoH: number;
  tiempoInvertidoH: number;
  montoPago: number | null;
  frecuenciaAvance: string;
};
