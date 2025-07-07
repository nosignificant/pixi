import { Graphics } from 'pixi.js';

export default class BackCircle {
  public dots: Graphics[] = []; // 직접 그린 점들 보관

  drawBackCircle(canvasWidth: number, slice: number): void {
    const stepX = canvasWidth / slice;

    for (let j = 0; j < slice; j++) {
      for (let i = 0; i < slice; i++) {
        const cx = stepX * i + stepX / 2;
        const cy = stepX * j + stepX / 2;

        const exists = this.dots.some((dot) => dot.x === cx && dot.y === cy);
        if (!exists) {
          const dot = new Graphics();
          dot.beginFill(0x000000);
          dot.drawCircle(0, 0, 1);
          dot.endFill();

          dot.x = cx;
          dot.y = cy;

          this.dots.push(dot); // 그리기만, container에 안 붙임
        }
      }
    }
  }
}
