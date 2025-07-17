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

  constructor(id: number, groupMap: Map<number, Group>) {
    this.currentId = id;
    this.viaPoints = [];
    this.graphic = new PIXI.Graphics();
    this.cells = [];
    this.avgPos = { x: 0, y: 0 };
    this.interests = [];
    this.mostInt = { point: { x: 0, y: 0 }, weight: 0 };
    this.groupMap = groupMap;
    this.groupInterestArr();
    this.groupNear = this.setGroupNear();
    this.hsl = this.setHSL();
    this.otherAVG = [];
  }

  /*settings*/
  /*settings*/
  /*settings*/

  update(groupMap: Map<number, Group>) {
    this.getGroupMap(groupMap); // groupMap 먼저 받아야 아래들 작동함
    this.setCloseCells(); // cells 채우기
    this.setAVGpos(); // 내 그룹 중심 계산
    this.setOtherAVGpos(); // 다른 그룹의 중심들 저장
    this.updateGroupInterest(); // 관심도 계산
    this.mostInterest(); // 가장 관심 높은 곳 찾기
    this.groupGoTo(); // 가장 관심 있는 곳으로 이동
    this.drawGroupCellsLines();
    this.drawLeg();
  }

  setGroupNear() {
    return this.cells.length * 70;
  }

  setAVGpos() {
    this.avgPos = Util.computeAvgPos(this.cells);
    //console.log(this.avgPos);
  }

  setOtherAVGpos() {
    this.otherAVG = Array.from(this.groupMap.values())
      .filter((group) => group.currentId !== this.currentId)
      .map((group) => group.avgPos);
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
    this.cells = cells ?? [];
  }
  /* groupInterest */
  /* groupInterest */
  /* groupInterest */

  groupInterestArr() {
    this.interests = BackCoord.points.map((point) => {
      return {
        point,
        weight: 0,
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
    console.log(this.interests);
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
      Util.towards(cell, 1, { point: this.mostInt.point }, true);
    });
  }

  /* drawing properties */
  /* drawing properties */
  /* drawing properties */

  drawGroupCellsLines() {
    console.log(this.cells.length, 'please work');
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
    this.graphic.lineStyle(1, this.hsl, 1);
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
