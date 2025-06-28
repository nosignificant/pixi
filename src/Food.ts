import { Graphics, Point, Container } from "pixi.js";

export default class Food {
  public food: Point[];
  private container: Container;

  constructor(container: Container) {
    this.food = [];
    this.container = container;
  }

  clicked(x: number, y: number): void {
    this.food.push(new Point(x, y));
  }

  drawFood(radius: number): void {
    this.food.forEach((vec) => {
      const dot = new Graphics();
      dot.beginFill(0x000000); // black
      dot.drawCircle(0, 0, radius);
      dot.endFill();
      dot.x = vec.x;
      dot.y = vec.y;
      this.container.addChild(dot);
    });

    // 이후 drawFood는 중복 호출 시 같은 dot들을 또 그릴 수 있으므로,
    // 필요 시 clear + redraw 처리도 고려 가능
  }
}
