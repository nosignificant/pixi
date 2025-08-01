import * as PIXI from 'pixi.js';
import Cell from './Cell';
import { viaPoint, Interest, Point, GroupChara } from './libs/type';
import Util from './libs/Util';
import BackCoord from './BackCoord';

export default class Group {
  currentId: number;
  groupNear: number;
  viaPoints: viaPoint[];
  graphic: PIXI.Graphics;
  cells: Cell[];
  avgPos: Point;
  interests: Interest[];
  mostInt: Interest;
  otherAVG: Point[];
  hsl: PIXI.Color;
  groupMap: Map<number, Group>;
  groupChara: GroupChara;
  gotoInterest: boolean;

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
    this.groupNear = 200;
    this.hsl = this.setHSL();
    this.otherAVG = [];
    this.groupChara = { fear: Math.random() * 10, brave: Math.random() * 10 };
    this.gotoInterest = true;
  }

  /*settings*/
  /*settings*/
  /*settings*/

  update(groupMap: Map<number, Group>) {
    this.setAVGpos(); // 내 그룹 중심 계산
    this.getGroupMap(groupMap); // groupMap 먼저 받아야 아래들 작동함
    this.setOtherAVGpos(); // 다른 그룹의 중심들 저장
    this.updateGroupInterest(); // 관심도 계산
    this.mostInterest(); // 가장 관심 높은 곳 찾기
    this.groupGoTo();
    this.checkNearGroup();
    this.checkFear();
  }

  groupDraw(canvasWidth: number, slice: number) {
    this.graphic.clear(); // 이전 프레임 그림 삭제

    this.drawGroupCellsLines(); // 선
    this.drawLeg(); // 다리
    this.showGroupInterest(canvasWidth, slice); // 관심도
  }

  //평균 위치 계산
  setAVGpos() {
    this.avgPos = Util.computeAvgPos(this.cells);
    //console.log(this.avgPos);
  }

  //다른 그룹 평균위치 받아옴
  setOtherAVGpos() {
    this.otherAVG = Array.from(this.groupMap.values())
      .filter((group) => group.currentId !== this.currentId)
      .map((group) => group.avgPos);
    //console.log(this.otherAVG);
  }

  //이그룹 색상 설정
  setHSL() {
    const h = this.currentId * 70;
    return new PIXI.Color({ h: h, s: 70, l: 70 });
  }

  getGroupMap(groupMap: Map<number, Group>) {
    this.groupMap = groupMap;
  }

  /* groupInterest */
  /* groupInterest */
  /* groupInterest */

  //초기화
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

    console.log('initialize groupInterest');
  }

  //
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
        interest.weight = Math.min(1, interest.weight + 0.1 + Math.random());
      } else {
        interest.weight = Math.max(0, interest.weight - 0.0001);
      }
    });
  }

  mostInterest() {
    if (this.interests.length === 0) return;

    const rand = Math.floor(Math.random() * this.interests.length);

    const randInterest = this.interests[rand];
    this.mostInt = {
      point: randInterest.point,
      weight: randInterest.weight,
    };
  }
  //    obj: T,target: Point, viaPoints: viaPoint[]

  groupGoTo() {
    if (this.gotoInterest) {
      this.cells.forEach((cell) => {
        Util.towards(cell, 1, { point: this.mostInt.point }, true);
      });
    }
  }

  /* drawing properties */
  /* drawing properties */
  /* drawing properties */

  drawGroupCellsLines() {
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
          // this.graphic.beginFill(hsl);
        } else this.graphic.beginFill(hsl, 0.2);
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
  }

  /* Group Behaviour */
  /* Group Behaviour */
  /* Group Behaviour */

  checkNearGroup(): Group[] {
    const nearGroup: Group[] = [];
    this.groupMap.forEach((other) => {
      const d = Util.dist(other.avgPos, this.avgPos);
      if (d < this.groupNear) {
        nearGroup.push(other);
      }
    });
    return nearGroup;
  }

  checkFear() {
    const nearGroup = this.checkNearGroup();
    if (nearGroup.length === 0) this.gotoInterest = true;
    nearGroup.forEach((other) => {
      const backNear = Util.closestObj(BackCoord.points, other.avgPos);

      if (this.groupChara.fear > other.groupChara.fear) {
        console.log('fear check, goto', backNear[100]);
        this.gotoInterest = false;
        this.cells.forEach((cell) => {
          Util.towards(cell, 3, { point: backNear[100] }, true);
        });
      }
    });
  }
}
//
