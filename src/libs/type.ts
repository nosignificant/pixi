export type Point = { x: number; y: number };

export type Interest = {
  point: Point;
  weight: number;
};

export type CellState = {
  isDead: boolean;
  inGroup: boolean;
  groupID: number | null;
};

export type viaPoint = {
  isVia: boolean;
  point: Point;
};

export type GroupChara = {
  fear: number;
  brave: number;
};
