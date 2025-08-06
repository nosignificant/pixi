import { Application } from 'pixi.js';
import Cell from './Cell';
import Group from './group';
import GB from './libs/GroupBehaviour';

export default class Simulation {
  groupMap = new Map<number, Group>();
  allCells: Cell[] = [];
  app: Application;
  boxWidth: number;
  cellID: number;

  constructor(app: Application, boxWidth: number) {
    this.app = app;
    this.boxWidth = boxWidth;
    this.cellID = 0;
    for (let i = 0; i < 20; i++) {
      const offsetX = Math.floor(Math.random() * 100);
      const offsetY = Math.floor(Math.random() * 100);
      const cell = new Cell(
        100 + i * 100 - offsetX,
        100 + i * 100 - offsetY,
        this.cellID
      );
      this.allCells.push(cell);
      app.stage.addChild(cell.graphic);
      // 초기 위치 설정
      cell.graphic.x = cell.point.x;
      cell.graphic.y = cell.point.y;
      this.cellID += 1;
    }

    // 그룹 생성 + 셀 배정 //
    const cellsPerGroup = 4;
    let groupID = 0;

    for (let i = 0; i < this.allCells.length; i += cellsPerGroup) {
      const group = new Group(groupID, this.groupMap);

      const slice = this.allCells.slice(i, i + cellsPerGroup);
      slice.forEach((cell) => {
        cell.state.groupID = groupID;
        group.cells.push(cell);
      });

      this.groupMap.set(groupID, group);
      app.stage.addChild(group.graphic);

      groupID++;
    }
    console.log(this.groupMap);
    console.log(this.allCells);
  }

  step() {
    for (const group of this.groupMap.values()) {
      group.update(this.groupMap);
      group.groupDraw(this.boxWidth);
    }

    // 🧠 셀 생성 로직은 group 당 조건 만족 시 1개 생성
    this.cellID = GB.addCell(
      this.groupMap,
      this.cellID,
      this.app,
      this.allCells
    );

    for (const cell of this.allCells) {
      cell.update(this.groupMap);
      cell.draw();
    }
  }
}
