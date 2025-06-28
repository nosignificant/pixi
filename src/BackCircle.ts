import { Point, Container, Graphics } from 'pixi.js';

export default class BackCircle {
  public backCircle: Point[];
  private container: Container;

  constructor(container: Container) {
    this.backCircle = [];
    this.container = container;
  }

  drawBackCircle(canvasWidth: number, slice: number): void {
    const stepX = canvasWidth / slice;

    for (let j = 0; j < slice; j++) {
      for (let i = 0; i < slice; i++) {
        const cx = stepX * i + stepX / 2;
        const cy = stepX * j + stepX / 2;

        const exists = this.backCircle.some((v) => v.x === cx && v.y === cy);

        if (!exists) {
          this.backCircle.push(new Point(cx, cy));

          // Pixi v7 방식으로 점 그리기
          const dot = new Graphics();
          dot.beginFill(0x000000);
          dot.drawCircle(cx, cy, 1);
          dot.endFill();
          this.container.addChild(dot);
        }
      }
    }
  }
}
