import Cell from '../Cell';

export type Point = { x: number; y: number };

export type Interests = {
  point: Point;
  weight: number;
};
export type GroupData = {
  cells: Cell[];
  avgPos: Point;
  interests: Interests[];
  mostInterest: Interests;
};
export type CellState = {
  isDead: boolean;
  inGroup: boolean;
  groupID: number | null;
};
