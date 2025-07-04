// src/Cell.ts
import * as PIXI from 'pixi.js';
import Util from './libs/Util';
import BackCoord from './BackCoord';
import { Point, CellState, Interests } from './libs/type';

export default class Cell {
  point: Point;
  strength = 0.001;
  creatureSTR = 0.1;
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

  constructor(x: number, y: number) {
    this.point = { x, y };
    this.health = 200;
    this.graphic = new PIXI.Graphics();
    this.interests = BackCoord.points.map((p) => ({
      point: p,
      weight: Math.random(),
    }));
  }

  draw() {
    this.graphic.clear();
    this.graphic.beginFill(new PIXI.Color(this.color).toNumber());
    this.graphic.lineStyle(1, 0x000000);
    this.graphic.drawCircle(0, 0, this.health / 5);
    this.graphic.endFill();
  }

  update(allCells: Cell[]) {
    const force = this.state.inGroup ? this.creatureSTR : this.strength;
    this.applySpacingForce(allCells, force);
    this.checkCloseCell(allCells);
    this.graphic.x = this.point.x;
    this.graphic.y = this.point.y;

    this.draw();
  }

  tryJoinGroup(groupID: number) {
    if (this.closeCells.length > 2) {
      this.state.inGroup = true;
      this.state.groupID = groupID;
      this.closeCells.forEach((cell) => {
        if (!cell.state.inGroup) {
          cell.state.inGroup = true;
          cell.state.groupID = groupID;
        }
      });
    }
  }

  checkCloseCell(others: Cell[]) {
    Util.checkNearObj(others, this.closeCells, this);
  }

  applySpacingForce(allCells: Cell[], strength: number) {
    allCells.forEach((other) => {
      if (this === other) return;

      const dist = Util.dist(this.point, other.point);
      if (dist === 0) return;

      const sameGroup =
        this.state.inGroup &&
        other.state.inGroup &&
        this.state.groupID === other.state.groupID;

      if (!sameGroup) {
        if (dist < this.health * 2) {
          Util.towards(this, strength * (this.health * 2 - dist), other, false);
        }
        return;
      }

      if (dist > this.health) {
        Util.towards(this, strength * (dist - this.health), other, true);
      }
    });
  }
  computeInterest() {}
}
