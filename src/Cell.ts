// src/Cell.ts
import * as PIXI from 'pixi.js';
import Util from './libs/Util';
import BackCoord from './BackCoord';
import { Point, CellState, Interests } from './libs/type';
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
    //근처에 있는 세포 확인
    this.checkCloseCell(allCells);
    const force = this.strength;
    this.applySpacingForce(force);
    this.graphic.x = this.point.x;
    this.graphic.y = this.point.y;
  }

  draw() {
    this.graphic.clear();
    if (this.state.groupID !== null && this.state.inGroup) {
      const h = this.state.groupID * 100;
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

  tryJoinGroup(groupID: number, groupMap: Map<number, Group>): void {
    const alreadyInGroup = Array.from(groupMap.values()).some((group) =>
      group.cells.includes(this)
    );

    if (this.closeCells.length > 3 && !alreadyInGroup) {
      const group = new Group(groupID, groupMap);
      group.getGroupMap(groupMap); // ✅ 여기 추가!!
      group.cells.push(this);
      this.state.groupID = groupID;
      this.state.inGroup = true;

      this.closeCells.forEach((c) => {
        if (!group.cells.includes(c)) {
          group.cells.push(c);
          c.state.groupID = groupID;
          c.state.inGroup = true;
        }
      });

      groupMap.set(groupID, group);
      console.log(`Group ${groupID} created with ${group.cells.length} cells`);
    }
  }

  checkCloseCell(others: Cell[]) {
    this.closeCells = Util.checkNearObj(others, this, this.near);
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
