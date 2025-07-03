// src/Cell.ts
import * as PIXI from 'pixi.js';
import Util from './Util';
import BackCoord from './BackCoord';

type Point = [number, number];

export default class Cell {
  util = new Util();
  bCoord = BackCoord.points;
  x: number;
  y: number;
  strength = 0.001;
  creatureSTR = 0.1;
  health: number;
  near = 200;
  isDead = false;
  inGroup = false;
  groupID: number | null = null;
  color: number[] = [1, 1, 1];

  closeCells: Cell[] = [];
  interestArr: [Point[], number] = [[...this.bCoord], 0];
  graphic: PIXI.Graphics;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.health = 200;
    this.graphic = new PIXI.Graphics();
  }

  draw() {
    this.graphic.clear();
    this.graphic.beginFill(new PIXI.Color(this.color).toNumber());
    this.graphic.lineStyle(1, 0x000000);
    this.graphic.drawCircle(0, 0, this.health / 5);
    this.graphic.endFill();
  }

  update(allCells: Cell[]) {
    const force = this.inGroup ? this.creatureSTR : this.strength;
    this.applySpacingForce(allCells, force);
    this.graphic.x = this.x;
    this.graphic.y = this.y;

    this.draw();
  }

  tryJoinGroup(groupID: number) {
    if (this.closeCells.length > 2) {
      this.inGroup = true;
      this.groupID = groupID;
      this.closeCells.forEach((cell) => {
        if (!cell.inGroup) {
          cell.inGroup = true;
          cell.groupID = groupID;
        }
      });
    }
  }

  checkCloseCell(others: Cell[]) {
    Util.checkNearObj(others, this.closeCells, this);
    //this.closeCells = this.closeCells.slice(0, 2);
    //console.log('cell.ts, closeCells', this.closeCells);
  }

  applySpacingForce(allCells: Cell[], strength: number) {
    allCells.forEach((other) => {
      if (this === other) return;

      const dist = Util.dist(this.x, this.y, other.x, other.y);
      if (dist === 0) return;

      const sameGroup =
        this.inGroup && other.inGroup && this.groupID === other.groupID;

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
}
