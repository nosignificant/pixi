import Group from '../group';
import Util from './Util';
import BackCoord from './BackCoord';
import Cell from '../Cell';
import * as PIXI from 'pixi.js';

export default class GroupBehaviour {
  static checkNearGroup(groupMap: Map<number, Group>, group: Group): Group[] {
    const nearGroup: Group[] = [];
    groupMap.forEach((other) => {
      const d = Util.dist(other.avgPos, group.avgPos);
      if (d < group.groupNear) {
        nearGroup.push(other);
      }
    });
    return nearGroup;
  }

  static checkFear(groupMap: Map<number, Group>, group: Group) {
    const nearGroups = this.checkNearGroup(groupMap, group);

    // 근처에 그룹 없으면 관심 이동 활성화 후 종료
    if (nearGroups.length === 0) group.gotoInterest = true;

    // 가장 먼 도망 위치 한 번만 계산
    const backNear = Util.closestObj(BackCoord.points, group.avgPos);
    const mostFar = backNear[backNear.length - 1];

    // 주변 그룹마다 fear/brave 비교
    for (const other of nearGroups) {
      if (group.groupChara.brave < other.groupChara.brave) {
        group.cells.forEach((cell) => {
          cell.state.fear += 0.01;
        });

        if (group.groupChara.fear > other.groupChara.fear) {
          console.log('gotoInterest false');
          group.gotoInterest = false;

          group.cells.forEach((cell) => {
            Util.towards(cell, 5, { point: mostFar }, true);
            cell.state.fear -= 0.01;
          });

          return;
        }
        group.gotoInterest = true;
      }
    }

    // 도망 조건 안 맞으면 관심 이동 유지
    group.gotoInterest = true;
  }

  static repelOther(groupMap: Map<number, Group>, group: Group) {
    const nearGroup = this.checkNearGroup(groupMap, group);
    if (nearGroup.length !== 0) {
      nearGroup.forEach((other) => {
        if (other !== group) {
          group.cells.forEach((cell) => {
            Util.towards(cell, 1, { point: other.avgPos }, false);
          });
        }
      });
    }
  }

  static addCell(
    groupMap: Map<number, Group>,
    cellID: number,
    app: PIXI.Application,
    allCells: Cell[]
  ): number {
    for (const group of groupMap.values()) {
      if (group.lifetime > 50) {
        const newCell = new Cell(group.avgPos.x, group.avgPos.y, cellID);
        newCell.state.groupID = group.currentId;

        group.cells.push(newCell);
        groupMap.set(group.currentId, group);
        group.lifetime -= 50;

        allCells.push(newCell); // ✅ 시뮬레이션에도 등록
        app.stage.addChild(newCell.graphic);

        console.log(cellID, 'added');
        return cellID + 1;
      }
    }
    return cellID;
  }
}
