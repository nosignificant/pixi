import Group from '../group';
import Util from './Util';
import BackCoord from './BackCoord';

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
    const nearGroup = this.checkNearGroup(groupMap, group);
    if (nearGroup.length === 0) group.gotoInterest = true;
    nearGroup.forEach((other) => {
      const backNear = Util.closestObj(BackCoord.points, other.avgPos);

      if (group.groupChara.fear > other.groupChara.fear) {
        group.gotoInterest = false;
        group.cells.forEach((cell) => {
          Util.towards(cell, 3, { point: backNear[100] }, true);
        });
      } else group.gotoInterest = true;
    });
  }
}
