import * as PIXI from 'pixi.js';
import Cell from './Cell';
import { GroupData } from './libs/type';
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
  interests: Interests[];
  mostInterest: Interests;
};
*/

// groupByID : id에 따라 cell을 groupMap에 등록 //
// setAllGroupAVGpos: groupMap 내 group들 평균 위치 계산해서 avgPos에 넣음 //
//

export default class Group {
  static currentId = 0;
  static groupMap = new Map<number, GroupData>();
  graphic: PIXI.Graphics = new PIXI.Graphics();

  static groupByID(allCells: Cell[]) {
    allCells.forEach((cell) => {
      const id = cell.state.groupID;
      // 세포에 id가 존재하고
      if (id != null) {
        // 1. 해당 id가 등록되어있지 않으면
        if (!Group.groupMap.has(id)) {
          // GroupData 전체 구조로 초기화
          Group.groupMap.set(id, {
            cells: [],
            avgPos: { x: 0, y: 0 }, // 초기값
            interests: [], // 초기값
            mostInterest: {
              point: { x: 0, y: 0 },
              weight: 0,
            },
          });
        }
        // 2. 해당 id가 등록되어 있으면
        Group.groupMap.get(id)!.cells.push(cell);
      }
    });
  }

  static update() {
    Group.setAllGroupAVGpos();
    Group.updateGroupInterest();
    Group.gotoInterest();
    Group.mostInterest();
  }

  static setAllGroupAVGpos() {
    Group.groupMap.forEach((groupData) => {
      groupData.avgPos = Util.computeAvgPos(groupData.cells);
    });
  }

  static drawGroupCellsLines(graphics: PIXI.Graphics) {
    Group.groupMap.forEach((groupData) => {
      const cells = groupData.cells.slice(0, 2);
      if (cells.length < 2) return;

      graphics.lineStyle(1, 0x8888ff, 1); // 얇은 파란 선

      for (let i = 0; i < cells.length - 1; i++) {
        const from = cells[i];
        const to = cells[i + 1];

        graphics.moveTo(from.point.x, from.point.y);
        graphics.lineTo(to.point.x, to.point.y);
      }
    });
  }

  /* groupInterest */
  /* groupInterest */

  static groupInterestArr() {
    Group.groupMap.forEach((groupData) => {
      groupData.interests = BackCoord.points.map((point) => ({
        point,
        weight: Math.random(),
      }));
      console.log('weight set: ', groupData.interests);
    });
  }

  static updateGroupInterest() {
    Group.groupMap.forEach((groupData) => {
      groupData.interests.forEach((interest) => {
        if (interest.weight < 1) interest.weight = interest.weight - 0.01;
      });
    });
  }

  static mostInterest() {
    Group.groupMap.forEach((groupData) => {
      if (groupData.interests.length === 0) return;

      const maxInterest = groupData.interests.reduce((prev, current) =>
        current.weight > prev.weight ? current : prev
      );

      groupData.mostInterest = {
        point: maxInterest.point,
        weight: maxInterest.weight,
      };
    });
  }

  static gotoInterest() {
    Group.groupMap.forEach((groupData) => {
      groupData.cells.forEach((cell) => {
        Util.towards(cell, 0.01, groupData.mostInterest, true);
      });
    });
  }
  static showGroupInterest(
    canvasWidth: number,
    slice: number,
    graphics: PIXI.Graphics
  ) {
    Group.groupMap.forEach((groupData) => {
      const boxWidth = canvasWidth / slice;
      //console.log(boxWidth);
      groupData.interests.forEach((interest) => {
        graphics.lineStyle(0);
        const h = interest.weight * 50;

        const hsl = new PIXI.Color({ h: h, s: 70, l: 70 });
        //console.log(hsl);
        if (interest.point === groupData.mostInterest.point) {
          graphics.beginFill('#000000');
          console.log(interest.point);
        } else graphics.beginFill(hsl);
        //console.log('hsl to rgba:', hsl.toRgbaString());

        graphics.drawRect(
          interest.point.x - boxWidth / 2,
          interest.point.y - boxWidth / 2,
          boxWidth,
          boxWidth
        );
        graphics.endFill();
      });
    });
    console.log('showGroupInterest update');
  }
}
