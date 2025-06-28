export default class Utils {
  dist(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }

  closestObj<T extends { x: number; y: number }>(
    array: T[],
    obj: { x: number; y: number },
  ): T[] {
    return array.slice().sort((a, b) => {
      const distA = this.dist(a.x, a.y, obj.x, obj.y);
      const distB = this.dist(b.x, b.y, obj.x, obj.y);
      return distA - distB;
    });
  }

  towards(
    obj: { x: number; y: number },
    force: number,
    other: { x: number; y: number },
    attract: boolean = true
  ): void {
    const dx = other.x - obj.x;
    const dy = other.y - obj.y;
    const dist = this.dist(obj.x, obj.y, other.x, other.y);
    if (dist === 0) return;

    const offsetX = dx / dist;
    const offsetY = dy / dist;

    const direction = attract ? 1 : -1;

    obj.x += offsetX * force * direction;
    obj.y += offsetY * force * direction;
  }

  checkNearObj<T extends { x: number; y: number }>(
    arr: T[],
    storeArr: T[],
    obj: { x: number; y: number; near: number }
  ): void {
    arr.forEach((element) => {
      const d = this.dist(obj.x, obj.y, element.x, element.y);
      if (d < obj.near) {
        storeArr.push(element);
      }
    });
  }
}
