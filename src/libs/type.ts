export type Point = { x: number; y: number };

export type Interests = {
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
