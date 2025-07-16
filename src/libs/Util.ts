import { Point, viaPoint } from './type';
//import BackCoord from '../BackCoord';
// dist: 거리 계산 //
// closestObj: 배열이 특정 오브젝트에 가까운 순으로 정렬 //
// towards : obj가 other 쪽으로 force의 힘으로 향함/멀어짐 //
// checkNearObj : arr에서 obj의 인식 반경 내부에 있는 요소 배열으로 반환 //
// computeAvgPos : point를 가진 arr의 평균 point 계산 //

export default class Util {
  static dist(point1: Point, point2: Point) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static closestObj(array: Point[], obj: Point): Point[] {
    return array.slice().sort((a, b) => {
      const distA = this.dist(a, obj);
      const distB = this.dist(b, obj);
      return distA - distB;
    });
  }

  //향하기 또는 멀어지기//
  static towards(
    obj: { point: Point },
    force: number,
    other: { point: Point },
    attract: boolean = true
  ): void {
    const dx = other.point.x - obj.point.x;
    const dy = other.point.y - obj.point.y;
    const dist = this.dist(obj.point, other.point);
    if (dist === 0) return;

    const offsetX = dx / dist;
    const offsetY = dy / dist;

    const direction = attract ? 1 : -1;

    obj.point.x += offsetX * force * direction;
    obj.point.y += offsetY * force * direction;
  }

  //인식 반경//
  static checkNearObj<T extends { point: Point }>(
    arr: T[],
    obj: T,
    near: number
  ): T[] {
    const storeArr: T[] = [];
    arr.forEach((element) => {
      const d = this.dist(obj.point, element.point);
      if (d < near) {
        if (d !== 0) storeArr.push(element);
      }
    });
    return storeArr;
  }

  // 배열 평균 위치 계산 //
  static computeAvgPos<T extends { point: Point }>(arr: T[]) {
    let sumX = 0;
    let sumY = 0;
    arr.forEach((element) => {
      sumX += element.point.x;
      sumY += element.point.y;
    });
    const len = arr.length || 1;
    return { x: sumX / len, y: sumY / len };
  }

  static getBestVia<T extends { point: Point }>(
    obj: T,
    target: Point,
    viaPoints: viaPoint[]
  ) {
    let bestPoint = { point: obj.point };
    let minDist = Infinity;

    if (Util.dist(obj.point, target) !== 0) {
      viaPoints.forEach((via) => {
        if (!via.isVia) {
          const total =
            Util.dist(obj.point, via.point) + Util.dist(via.point, target);
          if (total < minDist) {
            minDist = total;
            bestPoint = { point: via.point };
          }
          via.isVia = true;
        }
      });
      Util.towards(obj, 0.01, bestPoint, true);
    }
  }
}
