export default class BackCoord {
  x: number;
  y: number;

  constructor() {
    this.x = 0;
    this.y = 0;
  }

  drawBackCircle(canvasWidth: number, slice: number): void {
    const stepX = canvasWidth / slice;

    for (let j = 0; j < slice; j++) {
      for (let i = 0; i < slice; i++) {
        const cx = stepX * i + stepX / 2;
        const cy = stepX * j + stepX / 2;

        const exists = this.point.some((point) => point === (cx, cy));

        if (!exists) {
          this.point.push(cx, cy);
        }
      }
    }
    console.log('point', this.point);
  }
}
