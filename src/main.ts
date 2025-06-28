import { Application, Container } from "pixi.js";
import Cell from "./Cell";
import Enemy from "./Enemy";
import BackCircle from "./BackCircle";
import Food from "./Food";

console.log("Script loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");

  try {
    const pixiContainer = document.getElementById("pixi-container");
    if (!pixiContainer) {
      console.error("Pixi container not found!");
      return;
    }

    // 1. 앱 생성
    const app = new Application({
      width: pixiContainer.clientWidth,
      height: pixiContainer.clientHeight,
      backgroundColor: 0xffffff,
    });

    console.log("Application created");

    // 2. 캔버스를 컨테이너에 추가
    pixiContainer.appendChild(app.view as HTMLCanvasElement);
    console.log("Canvas appended to container");

    // 리사이즈 이벤트 처리
    window.addEventListener("resize", () => {
      app.renderer.resize(
        pixiContainer.clientWidth,
        pixiContainer.clientHeight
      );
    });

    // 3. 전역 변수
    const allCells: Cell[] = [];
    const allEnemies: Enemy[] = [];
    let currentGroupId = 0;

    // 마우스 위치 변수
    let mouseX = 0;
    let mouseY = 0;

    // Pixi 스테이지에서 마우스 위치 추적
    app.stage.eventMode = "static";
    app.stage.hitArea = app.screen; // 스테이지의 히트 영역을 화면 전체로 설정
    app.stage.on("pointermove", (event) => {
      const pos = event.global;
      mouseX = pos.x;
      mouseY = pos.y;
      // 디버깅을 위해 마우스 좌표를 콘솔에 출력
      console.log(
        `Mouse Coordinates: x=${mouseX.toFixed(2)}, y=${mouseY.toFixed(2)}`
      );
    });

    // 4. 객체 초기화
    const enemy = new Enemy(mouseX, mouseY);

    const backgroundContainer = new Container();
    const foodContainer = new Container();

    app.stage.addChild(backgroundContainer);
    app.stage.addChild(foodContainer);

    const b = new BackCircle(backgroundContainer);
    b.drawBackCircle(app.screen.width, 20);

    new Food(foodContainer);

    // 5. Cell 생성
    for (let i = 0; i < 10; i++) {
      const offsetX = Math.floor(Math.random() * 100);
      const offsetY = Math.floor(Math.random() * 100);
      const cell = new Cell(100 + i * 50 - offsetX, 100 + i * 50 - offsetY);
      allCells.push(cell);
      app.stage.addChild(cell.graphic);
      // 초기 위치 설정
      cell.graphic.x = cell.x;
      cell.graphic.y = cell.y;
    }

    allEnemies.push(enemy);
    app.stage.addChild(enemy.graphic);
    // 초기 위치 설정
    enemy.graphic.x = enemy.x;
    enemy.graphic.y = enemy.y;

    // 7. 매 프레임 업데이트
    app.ticker.add(() => {
      enemy.update(mouseX, mouseY);

      allCells.forEach((cell) => {
        cell.checkCloseEnemy(allEnemies);
        cell.checkCloseCell(allCells);

        if (!cell.inGroup && cell.closeCells.length > 2) {
          currentGroupId += 1;
          cell.tryJoinGroup(currentGroupId);
        }

        cell.update(allCells);
      });
    });

    console.log("Animation started");
  } catch (error) {
    console.error("Error creating Pixi app:", error);
  }
});
