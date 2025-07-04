import { Point } from './libs/type';

export default class BackCoord {
  static points: Point[] = [];

  constructor(x: number, y: number) {
    BackCoord.points.push({ x, y });
  }

  drawBackCoord(canvasWidth: number, slice: number): void {
    const stepX = canvasWidth / slice;

    for (let j = 0; j < slice; j++) {
      for (let i = 0; i < slice; i++) {
        const cx = stepX * i + stepX / 2;
        const cy = stepX * j + stepX / 2;

        const exists = BackCoord.points.some(
          ({ x, y }) => x === cx && y === cy
        );

        if (!exists) {
          BackCoord.points.push({ x: cx, y: cy });
        }
      }
    }
  }
}
