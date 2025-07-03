import Cell from './Cell';
import * as PIXI from 'pixi.js';

type Point = [number, number];

export default class Group {
  groupCNT: number;
  groupAVGpos: Point;
  groupCells: Cell[];

  constructor(nowID: number) {
    this.groupCNT = nowID;
    this.groupAVGpos = [0, 0];
    this.groupCells = [];
  }

  setAVGpos() {
    let sumX = 0;
    let sumY = 0;
    this.groupCells.forEach((cell) => {
      sumX += cell.x;
      sumY += cell.y;
    });
    const len = this.groupCells.length || 1;
    this.groupAVGpos = [sumX / len, sumY / len];
  }

  static groupByID(allCells: Cell[], groupMap: Map<number, Cell[]>) {
    allCells.forEach((cell) => {
      const id = cell.groupID;
      if (id != null) {
        if (!groupMap.has(id)) {
          groupMap.set(id, []);
        }
        groupMap.get(id)!.push(cell);
      }
    });
  }

  static drawGroupCellsLines(group: Cell[], graphics: PIXI.Graphics) {
    const cells = group;

    if (cells.length < 1) return;

    graphics.lineStyle(1, 0x8888ff, 1); // 얇은 파란 선

    for (let i = 0; i < cells.length - 1; i++) {
      const from = cells[i];
      const to = cells[i + 1];

      graphics.moveTo(from.x, from.y);
      graphics.lineTo(to.x, to.y);
    }
  }

  // static computeInterestArr(){}
}
