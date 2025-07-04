import * as PIXI from 'pixi.js';
import Cell from './Cell';
import { GroupData } from './libs/type';
import Util from './libs/Util';

export default class Group {
  static currentId = 0;
  static groupMap = new Map<number, GroupData>();

  static groupByID(allCells: Cell[]) {
    allCells.forEach((cell) => {
      const id = cell.state.groupID;
      if (id != null) {
        if (!Group.groupMap.has(id)) {
          // GroupData 전체 구조로 초기화 필요
          Group.groupMap.set(id, {
            cells: [],
            avgPos: { x: 0, y: 0 }, // 초기값
            interests: [], // 초기값
          });
        }
        Group.groupMap.get(id)!.cells.push(cell);
      }
    });
  }

  static setAllGroupAVGpos() {
    Group.groupMap.forEach((groupData) => {
      groupData.avgPos = Util.computeAvgPos(groupData.cells);
    });
  }

  static drawGroupCellsLines(graphics: PIXI.Graphics) {
    Group.groupMap.forEach((groupData) => {
      const cells = groupData.cells.slice(0, 2);
      if (cells.length < 2) return;

      graphics.lineStyle(1, 0x8888ff, 1); // 얇은 파란 선

      for (let i = 0; i < cells.length - 1; i++) {
        const from = cells[i];
        const to = cells[i + 1];

        graphics.moveTo(from.point.x, from.point.y);
        graphics.lineTo(to.point.x, to.point.y);
      }
    });
  }

  static groupInterestArr() {}
}
