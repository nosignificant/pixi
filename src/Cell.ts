// src/Cell.ts
import * as PIXI from 'pixi.js';
import Util from './libs/Util';
import BackCoord from './BackCoord';
import { Point, CellState, Interests } from './libs/type';
import Group from './group';

export default class Cell {
  cellID = 0;
  point: Point;
  strength = 0.001;
  creatureSTR = 1;
  health: number;
  near = 200;

  state: CellState = {
    isDead: false,
    inGroup: false,
    groupID: null,
  };
  color: number[] = [1, 1, 1];

  closeCells: Cell[] = [];
  interests: Interests[] = [];
  graphic: PIXI.Graphics;

  constructor(x: number, y: number, ID: number) {
    this.cellID = ID;
    this.point = { x: x, y: y };
    this.health = 20;
    this.graphic = new PIXI.Graphics();
    this.interests = BackCoord.points.map((p) => ({
      point: p,
      weight: Math.random(),
    }));
  }

  update(allCells: Cell[]) {
    this.checkCloseCell(allCells);

    const force = this.state.inGroup ? this.creatureSTR : this.strength;
    this.applySpacingForce(allCells, force);
    this.graphic.x = this.point.x;
    this.graphic.y = this.point.y;
    this.draw();
  }

  draw() {
    this.graphic.clear();
    if (this.state.groupID !== null && this.state.inGroup) {
      const h = this.state.groupID * 70;
      const hsl = new PIXI.Color({ h: h, s: 70, l: 70 });
      this.graphic.beginFill(hsl);
    } else {
      this.graphic.lineStyle(1, 0x000000, 1); // 검은 테두리
      this.graphic.beginFill(0xffffff); // 흰색 채우기
    }
    this.graphic.drawCircle(0, 0, this.health / 5);
    this.graphic.endFill();
    //console.log('draw called', this.point.x, this.point.y);
    //console.log('cell created at', this.point.x, this.point.y);
  }

  ///  이거 고쳐야돼!!! ///
  tryJoinGroup(groupID: number): void {
    // 셀 자신이 이미 그룹에 속해있거나, closeCells 중 하나라도 그룹에 속해있으면 그룹 생성 불가
    const alreadyGrouped =
      this.state.inGroup || this.closeCells.some((c) => c.state.inGroup);

    if (alreadyGrouped || this.closeCells.length <= 2) return;

    // 그룹에 참여
    this.state.inGroup = true;
    this.state.groupID = groupID;

    console.log('success grouping: ', groupID);
  }

  checkCloseCell(others: Cell[]) {
    this.closeCells = Util.checkNearObj(others, this, this.near);
  }

  applySpacingForce(allCells: Cell[], strength: number) {
    allCells.forEach((other) => {
      if (this === other) return;

      const dist = Util.dist(this.point, other.point);
      if (dist === 0) return;

      if (other.state.groupID !== this.state.groupID) {
        if (dist < this.health * 3) {
          Util.towards(this, strength, other, false);
        }
      }

      if (dist > this.health * 15) {
        Util.towards(this, strength, other, true);
      }
    });
  }

  groupForce(strength: number, groupMap: Map<number, Group>) {
    if (this.state.groupID !== null) {
      const group = groupMap.get(this.state.groupID);
      console.log(group);
      if (group !== undefined) {
        group.cells.forEach((other) => {
          if (this === other) return;

          const dist = Util.dist(this.point, other.point);
          if (dist < this.health) {
            Util.towards(this, strength * 10, other, false);
          }
          if (dist === 0) return;
          if (dist > this.health * 2)
            Util.towards(this, strength, { point: group.avgPos }, true);
        });
      } else {
        console.log(this.state.groupID, ' : groupdata undefined');
      }
    }
  }
}
