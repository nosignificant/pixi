import * as PIXI from "pixi.js";

export default class Enemy {
  public x: number;
  public y: number;
  public size: number;
  public speed = 0.1; // 적이 마우스를 따라오는 속도 (0~1 사이 값)
  public graphic: PIXI.Graphics;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.graphic = new PIXI.Graphics();
    this.draw(); // 초기화 시점에서 한 번 그림
  }

  update(targetX: number, targetY: number): void {
    // 현재 위치에서 목표 위치(마우스)까지의 거리를 speed 비율만큼 이동
    this.x += (targetX - this.x) * this.speed;
    this.y += (targetY - this.y) * this.speed;

    // 그래픽의 위치를 객체의 위치로 업데이트
    this.graphic.x = this.x;
    this.graphic.y = this.y;
  }

  draw(): void {
    this.graphic.clear();
    this.graphic.beginFill(0xff0000); // 빨간색
    this.graphic.drawCircle(0, 0, this.size / 2); // 원점을 기준으로 그림
    this.graphic.endFill();
  }
}
