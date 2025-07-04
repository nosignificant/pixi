import { Point } from './type';

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
