import * as PIXI from 'pixi.js';
import Cell from './Cell';
//import BackCircle from './BackCircle';
import Group from './group';
import BackCoord from './BackCoord';

const allCells: Cell[] = [];
const groupMap = new Map<number, Group>();

document.addEventListener('DOMContentLoaded', () => {
  try {
    const pixiContainer = document.getElementById('pixi-container');
    if (!pixiContainer) {
      console.error('Pixi container not found!');
      return;
    }

    const app = new PIXI.Application({
      width: pixiContainer.clientWidth,
      height: pixiContainer.clientHeight,
      backgroundColor: 0xffffff,
    });

    pixiContainer.appendChild(app.view as HTMLCanvasElement);
    console.log('Canvas appended to container');

    window.addEventListener('resize', () => {
      app.renderer.resize(
        pixiContainer.clientWidth,
        pixiContainer.clientHeight
      );
    });

    //변수들//

    const graphics = new PIXI.Graphics();
    app.stage.addChild(graphics);
    BackCoord.drawBackCoord(pixiContainer.clientWidth, 20);

    /*const backgroundContainer = new PIXI.Container();
    app.stage.addChild(backgroundContainer);

    const b = new BackCircle();
    b.drawBackCircle(app.screen.width, 20);
    b.dots.forEach((dot) => backgroundContainer.addChild(dot));*/

    console.log('cell initialize');
    let cellID = 0;
    for (let i = 0; i < 20; i++) {
      const offsetX = Math.floor(Math.random() * 100);
      const offsetY = Math.floor(Math.random() * 100);
      const cell = new Cell(
        100 + i * 50 - offsetX,
        100 + i * 50 - offsetY,
        cellID
      );
      allCells.push(cell);
      app.stage.addChild(cell.graphic);
      // 초기 위치 설정
      cell.graphic.x = cell.point.x;
      cell.graphic.y = cell.point.y;
      cellID += 1;
    }
    // 매 프레임 업데이트 //

    app.ticker.add(() => {
      let currentID = 0;
      graphics.clear();
      groupMap.forEach((group) => {
        app.stage.removeChild(group.graphic); // ✅ stage에서 먼저 제거
      });
      //groupMap초기화//

      groupMap.clear();
      allCells.forEach((cell) => {
        cell.state.groupID = null;
        cell.state.inGroup = false;
      });

      allCells.forEach((cell) => {
        if (!cell.state.inGroup) {
          cell.tryJoinGroup(currentID, groupMap);
          if (cell.state.inGroup) currentID += 1; // 성공한 경우에만 증가
        }
        cell.groupForce(0.5, groupMap);
        cell.update(allCells);
        cell.draw();
      });
      groupMap.forEach((group) => {
        group.update(groupMap);
        //group.showGroupInterest(pixiContainer.clientWidth, 20);
        app.stage.addChild(group.graphic);
      });
    });

    console.log('Animation started');
  } catch (error) {
    console.error('Error creating Pixi app:', error);
  }
});
