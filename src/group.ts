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
  groupNear: number;
  viaPoints: viaPoint[];
  graphic: PIXI.Graphics;
  cells: Cell[];
  avgPos: Point;
  interests: Interests[];
  mostInt: Interests;
  otherAVG: Point[];
  hsl: PIXI.Color;
  groupMap: Map<number, Group>;

  constructor(id: number) {
    this.currentId = id;
    this.viaPoints = [];
    this.graphic = new PIXI.Graphics();
    this.cells = [];
    this.avgPos = { x: 0, y: 0 };
    this.interests = [];
    this.mostInt = { point: { x: 0, y: 0 }, weight: 0 };
    this.groupMap = new Map();
    this.groupInterestArr();
    this.groupNear = this.setGroupNear();
    this.hsl = this.setHSL();
    this.otherAVG = [];
  }

  /*settings*/
  /*settings*/
  /*settings*/

  static groupByID(allCells: Cell[], groupMap: Map<number, Group>) {
    allCells.forEach((cell) => {
      const id = cell.state.groupID;
      // 세포에 id가 존재하고
      if (id != null) {
        // 1. 해당 id가 등록되어있지 않으면
        if (!groupMap.has(id)) {
          const newG = new Group(id);
          groupMap.set(id, newG);
        }
        groupMap.get(id)?.cells.push(cell);
      }
    });

    groupMap.forEach((group) => {
      console.log(group.cells.length);
    });
    return groupMap;
  }

  update() {
    this.setAVGpos();
    this.mostInterest();
    this.drawGroupCellsLines();
    this.updateGroupInterest();
    this.drawLeg();
    this.groupGoTo();
    this.setOtherAVGpos();
    this.cells = this.setCloseCells();
  }

  setGroupNear() {
    return this.cells.length * 100;
  }

  setAVGpos() {
    this.avgPos = Util.computeAvgPos(this.cells);
    //console.log(this.avgPos);
  }

  setOtherAVGpos() {
    this.otherAVG = Array.from(this.groupMap.values()).map(
      (group) => group.avgPos
    );
  }

  setHSL() {
    const h = this.currentId * 70;
    return new PIXI.Color({ h: h, s: 70, l: 70 });
  }

  getGroupMap(groupMap: Map<number, Group>) {
    this.groupMap = groupMap;
  }

  setCloseCells() {
    const cells = this.groupMap.get(this.currentId)?.cells;
    if (cells !== undefined) return cells;
    else return [];
  }
  /* groupInterest */
  /* groupInterest */
  /* groupInterest */

  groupInterestArr() {
    this.interests = BackCoord.points.map((point) => {
      let plusMinus = 1;
      if (Math.random() < 0.5) plusMinus = -1;
      return {
        point,
        weight: Math.random() * plusMinus,
      };
    });

    this.viaPoints = BackCoord.points.map((point) => ({
      isVia: false,
      point,
    }));

    //console.log('weight set: ', this.interests);
  }

  updateGroupInterest() {
    const updateArr: Point[] = [];

    this.otherAVG.forEach((otherPoint) => {
      BackCoord.points.forEach((backPoint) => {
        const d = Util.dist(otherPoint, backPoint);
        if (d < this.groupNear) {
          updateArr.push(backPoint);
        }
      });
    });

    this.interests.forEach((interest) => {
      const matched = updateArr.some(
        (p) => p.x === interest.point.x && p.y === interest.point.y
      );

      if (matched) {
        interest.weight = Math.min(1, interest.weight + 0.1); // 예: 최대값 1 제한
      } else {
        interest.weight = Math.max(0, interest.weight - 0.01); // 예: 점점 감소
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
  //    obj: T,target: Point, viaPoints: viaPoint[]

  groupGoTo() {
    this.cells.forEach((cell) => {
      Util.getBestVia(cell, this.mostInt.point, this.viaPoints);
    });
  }

  /* drawing properties */
  /* drawing properties */
  /* drawing properties */

  drawGroupCellsLines() {
    this.graphic.clear();
    const cells = this.cells;
    if (cells.length < 2) return;

    this.graphic.lineStyle(1, this.hsl, 3);
    for (let i = 0; i < cells.length - 1; i++) {
      const from = cells[i];
      const to = cells[i + 1];

      this.graphic.moveTo(from.point.x, from.point.y);
      this.graphic.lineTo(to.point.x, to.point.y);
    }
  }

  drawLeg() {
    const cells = this.cells.slice(0, 3);
    const pointArray = this.viaPoints.map((v) => v.point);
    if (cells.length < 2) return;
    this.graphic.lineStyle(1, this.hsl, 3);
    for (let i = 0; i < cells.length - 1; i++) {
      const from = cells[i].point;
      const to = Util.closestObj(pointArray, from)[2];

      if (!to) continue; // 안전장치
      let isUp = -1;
      if (from.y > to.y) isUp = +1;
      const mid = {
        x: (from.x + to.x) / 2 + 10 * isUp - (from.y - to.y) / 100,
        y: (from.y + to.y) / 2 + 10 * isUp - (from.y - to.y) / 100,
      };

      // from → mid
      this.graphic.moveTo(from.x, from.y);
      this.graphic.lineTo(mid.x, mid.y);

      // mid → to
      this.graphic.moveTo(mid.x, mid.y);
      this.graphic.lineTo(to.x, to.y);
    }
  }

  showGroupInterest(canvasWidth: number, slice: number) {
    const boxWidth = canvasWidth / slice;
    //console.log(boxWidth);
    this.interests.forEach((interest) => {
      this.graphic.lineStyle(0);
      if (interest.weight > 0.5) {
        const h = interest.weight * this.currentId * 70;

        const hsl = new PIXI.Color({ h: h, s: 70, l: 70 });
        //console.log(hsl);
        if (interest.point === this.mostInt.point) {
          this.graphic.beginFill('#000000');
          //console.log(interest.point);
        } else this.graphic.beginFill(hsl, 0.3);
        //console.log('hsl to rgba:', hsl.toRgbaString());

        this.graphic.drawRect(
          interest.point.x - boxWidth / 2,
          interest.point.y - boxWidth / 2,
          boxWidth,
          boxWidth
        );
        this.graphic.endFill();
      }
    });
    //console.log('showGroupInterest update');
  }
}
