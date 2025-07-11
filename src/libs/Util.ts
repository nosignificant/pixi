import { Point } from './type';

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

  static closestObj<T extends { point: Point }>(
    array: T[],
    obj: { point: Point }
  ): T[] {
    return array.slice().sort((a, b) => {
      const distA = this.dist(a.point, obj.point);
      const distB = this.dist(b.point, obj.point);
      return distA - distB;
    });
  }

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
    storeArr: T[],
    obj: { point: Point; near: number }
  ): void {
    arr.forEach((element) => {
      const d = this.dist(obj.point, element.point);
      if (d < obj.near) {
        storeArr.push(element);
      }
    });
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
}
