// src/Cell.ts
import * as PIXI from 'pixi.js';
import Util from './libs/Util';
import BackCoord from './BackCoord';
import { Point, CellState, Interest } from './libs/type';
import Group from './group';

export default class Cell {
  cellID = 0;
  point: Point;
  strength = 1;
  health: number;
  near = 200;
  state: CellState = {
    isDead: false,
    inGroup: false,
    groupID: null,
  };
  color: number[] = [1, 1, 1];
  closeCells: Cell[] = [];
  interests: Interest[] = [];
  graphic: PIXI.Graphics;
  group: Group;

  constructor(x: number, y: number, ID: number) {
    this.cellID = ID;
    this.point = { x: x, y: y };
    this.health = 20;
    this.graphic = new PIXI.Graphics();
    this.interests = BackCoord.points.map((p) => ({
      point: p,
      weight: Math.random(),
    }));
    this.group = this.getGroup();
  }

  update() {
    //근처에 있는 세포 확인
    //this.checkCloseCell(allCells);

    this.applySpacingForce(this.strength);
    this.graphic.x = this.point.x;
    this.graphic.y = this.point.y;
  }

  draw() {
    this.graphic.clear();
    let h = 0;
    if (this.state.groupID !== null) {
      h = this.state.groupID * 100;
    }
    const hsl = new PIXI.Color({ h: h, s: 70, l: 70 });
    this.graphic.beginFill(hsl);

    this.graphic.drawCircle(0, 0, this.health / 5);
    this.graphic.endFill();
  }

  checkCloseCell(others: Cell[]) {
    this.closeCells = Util.checkNearObj(others, this, this.near);
  }

  getGroup(groupMap: Map<number, Group>) {
    if (this.state.groupID !== null) return groupMap.get(this.state.groupID);
    else return new Group();
  }

  applySpacingForce(strength: number) {
    this.closeCells.forEach((other) => {
      if (this === other) return;

      const dist = Util.dist(this.point, other.point);
      if (dist === 0) return;

      if (dist > this.health) {
        Util.towards(this, strength, other, true);
      }
    });
  }

  groupForce(strength: number, groupMap: Map<number, Group>) {
    if (this.state.groupID !== null) {
      const group = groupMap.get(this.state.groupID);
      if (group !== undefined) {
        group.cells.forEach((other) => {
          if (this === other) return;

          const dist = Util.dist(this.point, other.point);
          if (dist < this.health) {
            Util.towards(this, strength, other, false);
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
