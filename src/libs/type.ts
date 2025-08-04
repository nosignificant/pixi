export type Point = { x: number; y: number };

export type Interest = {
  point: Point;
  weight: number;
};

export type CellState = {
  isDead: boolean;
  groupID: number | null;
  fear: number;
  brave: number;
};

export type GroupChara = {
  fear: number;
  brave: number;
};
