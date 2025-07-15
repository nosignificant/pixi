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
    const force = this.state.inGroup ? this.creatureSTR : this.strength;
    this.applySpacingForce(allCells, force);
    this.checkCloseCell(allCells);
    this.graphic.x = this.point.x;
    this.graphic.y = this.point.y;
    this.draw();
  }

  draw() {
    this.graphic.clear();
    this.graphic.beginFill(new PIXI.Color(this.color).toNumber());
    this.graphic.lineStyle(1, 0x000000);
    this.graphic.drawCircle(0, 0, this.health / 5);
    this.graphic.endFill();
    //console.log('draw called', this.point.x, this.point.y);
    //console.log('cell created at', this.point.x, this.point.y);
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
      console.log('success grouping: ', this.state.groupID);
    }
  }

  checkCloseCell(others: Cell[]) {
    this.closeCells = Util.checkNearObj(others, this);
  }

  applySpacingForce(allCells: Cell[], strength: number) {
    allCells.forEach((other) => {
      if (this === other) return;

      const dist = Util.dist(this.point, other.point);
      if (dist === 0) return;

      if (other.state.groupID !== this.state.groupID) {
        if (dist < this.health) {
          Util.towards(this, strength * 1000, other, false);
        }
      }

      if (dist > this.health * 5) {
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
          if (dist === 0) return;
          Util.towards(this, strength * 100, { point: group.avgPos }, true);
        });
      } else {
        console.log(this.state.groupID, ' : groupdata undefined');
      }
    }
  }
}
