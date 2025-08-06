import { Point } from './type';

export default class BackCoord {
  static points: Point[] = [];

  static drawBackCoord(canvasWidth: number, slice: number): void {
    const boxWidth = canvasWidth / slice;
    for (let j = 0; j < slice; j++) {
      for (let i = 0; i < slice; i++) {
        const cx = i * boxWidth + boxWidth / 2;
        const cy = j * boxWidth + boxWidth / 2;

        BackCoord.points.push({ x: cx, y: cy });
      }
    }
  }
}
