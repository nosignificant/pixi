import * as PIXI from 'pixi.js';
import Cell from './Cell';
import { viaPoint, Interests, Point } from './libs/type';
import Util from './libs/Util';
import BackCoord from './BackCoord';

/* 
export type Interests = {
  point: Point;
  weight: number;
};

export type GroupData = {
  cells: Cell[];
  avgPos: Point;
  avgPos: Point;
  interests: Interests[];
  mostInterest: Interests;
};
*/

// groupByID : id에 따라 cell을 groupMap에 등록 //
// setAllGroupAVGpos: groupMap 내 group들 평균 위치 계산해서 avgPos에 넣음 //
//

export default class Group {
  currentId: number;
  viaPoints: viaPoint[];
  graphic: PIXI.Graphics;
  cells: Cell[];
  avgPos: Point;
  interests: Interests[];
  mostInt: Interests;

  constructor(id: number, closeCell: Cell[]) {
    this.currentId = id;
    this.groupInterestArr();
    this.viaPoints = [];
    this.graphic = new PIXI.Graphics();
    this.cells = closeCell;
    this.avgPos = { x: 0, y: 0 };
    this.interests = [];
    this.mostInt = { point: { x: 0, y: 0 }, weight: 0 };
  }

  static groupByID(allCells: Cell[], groupMap: Map<number, Group>) {
    allCells.forEach((cell) => {
      const id = cell.state.groupID;
      // 세포에 id가 존재하고
      if (id != null) {
        // 1. 해당 id가 등록되어있지 않으면
        if (!groupMap.has(id)) {
          const newG = new Group(id, cell.closeCells);
          groupMap.set(id, newG);
        }
      }
    });
    return groupMap;
  }

  update() {
    this.setAVGpos();
    this.updateGroupInterest();
    this.mostInterest();
    this.drawGroupCellsLines();
  }

  setAVGpos() {
    this.avgPos = Util.computeAvgPos(this.cells);
    //console.log(this.avgPos);
  }

  drawGroupCellsLines() {
    const cells = this.cells.slice(0, 2);
    if (cells.length < 2) return;

    this.graphic.lineStyle(1, 0x8888ff, 1); // 얇은 파란 선

    for (let i = 0; i < cells.length - 1; i++) {
      const from = cells[i];
      const to = cells[i + 1];

      this.graphic.moveTo(from.point.x, from.point.y);
      this.graphic.lineTo(to.point.x, to.point.y);
    }
  }

  /* groupInterest */
  /* groupInterest */
  /* groupInterest */

  groupInterestArr() {
    this.interests = BackCoord.points.map((point) => ({
      point,
      weight: Math.random(),
    }));

    this.viaPoints = BackCoord.points.map((point) => ({
      isVia: false,
      point,
    }));
    //console.log('weight set: ', this.interests);
  }

  updateGroupInterest() {
    this.interests.forEach((interest) => {
      interest.weight = Math.max(0, interest.weight - 0.01);

      // 예시: 랜덤 확률로 다시 살짝 증가
      if (Math.random() < 0.01) {
        interest.weight = Math.random(); // 새롭게 관심 끌림
      }
    });
  }

  mostInterest() {
    if (this.interests.length === 0) return;

    const maxInterest = this.interests.reduce((prev, current) =>
      current.weight > prev.weight ? current : prev
    );

    this.mostInt = {
      point: maxInterest.point,
      weight: maxInterest.weight,
    };
  }

  showGroupInterest(canvasWidth: number, slice: number) {
    const boxWidth = canvasWidth / slice;
    //console.log(boxWidth);
    this.interests.forEach((interest) => {
      this.graphic.lineStyle(0);
      const h = interest.weight * 50;

      const hsl = new PIXI.Color({ h: h, s: 70, l: 70 });
      //console.log(hsl);
      if (interest.point === this.mostInt.point) {
        this.graphic.beginFill('#000000');
        console.log(interest.point);
      } else this.graphic.beginFill(hsl);
      console.log('hsl to rgba:', hsl.toRgbaString());

      this.graphic.drawRect(
        interest.point.x - boxWidth / 2,
        interest.point.y - boxWidth / 2,
        boxWidth,
        boxWidth
      );
      this.graphic.endFill();
    });
    //console.log('showGroupInterest update');
  }
}
