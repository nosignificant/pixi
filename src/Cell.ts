// src/Cell.ts
import * as PIXI from "pixi.js";
import Util from "./Utils";

export default class Cell {
  util = new Util();

  x: number;
  y: number;
  character = 5;
  strength = 0.001;
  creatureSTR = 0.1;
  health: number;
  near = 200;
  inGroup = false;
  groupId: number | null = null;
  fear = 0;
  color: number[] = [1, 1, 1];

  closeEnemies: any[] = [];
  closeCells: Cell[] = [];
  graphic: PIXI.Graphics;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.health = 10 * this.character;
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
    this.fearAction();

    this.graphic.x = this.x;
    this.graphic.y = this.y;

    this.draw();
  }

  tryJoinGroup(groupId: number) {
    if (this.closeCells.length > 2) {
      this.inGroup = true;
      this.groupId = groupId;
      this.closeCells.forEach((cell) => {
        if (!cell.inGroup) {
          cell.inGroup = true;
          cell.groupId = groupId;
        }
      });
    }
  }

  checkCloseEnemy(enemies: any[]) {
    this.closeEnemies = [];
    this.util.checkNearObj(enemies, this.closeEnemies, this);
  }

  checkCloseCell(others: Cell[]) {
    this.closeCells = [];
    this.util.checkNearObj(others, this.closeCells, this);
  }

  applySpacingForce(allCells: Cell[], strength: number) {
    allCells.forEach((other) => {
      if (this === other) return;

      const dist = this.util.dist(this.x, this.y, other.x, other.y);
      if (dist === 0) return;

      const sameGroup =
        this.inGroup && other.inGroup && this.groupId === other.groupId;

      if (!sameGroup) {
        if (dist < this.health * 2) {
          this.util.towards(
            this,
            strength * (this.health * 2 - dist),
            other,
            false
          );
        }
        return;
      }

      if (dist > this.health) {
        this.util.towards(this, strength * (dist - this.health), other, true);
      }
    });
  }

  fearAction() {
    if (this.closeEnemies.length > 0) {
      this.fear += 0.1;
      this.closeEnemies.forEach((enemy) =>
        this.util.towards(this, 1, enemy, false)
      );
    } else {
      this.fear -= 0.1;
    }

    this.color = this.fear > 0 ? [0, 1, 1] : [1, 1, 1];
  }
}
