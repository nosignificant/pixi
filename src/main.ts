import * as PIXI from 'pixi.js';
import Cell from './Cell';
import BackCircle from './BackCircle';
import Group from './group';
import BackCoord from './BackCoord';

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
    const allCells: Cell[] = [];
    const groupMap = new Map<number, Group>();

    const backgroundContainer = new PIXI.Container();
    const graphics = new PIXI.Graphics();
    app.stage.addChild(graphics);
    app.stage.addChild(backgroundContainer);

    const b = new BackCircle();
    b.drawBackCircle(app.screen.width, 20);
    b.dots.forEach((dot) => backgroundContainer.addChild(dot));

    BackCoord.drawBackCoord(app.screen.width, 20);

    console.log('cell initialize');
    let cellID = 0;
    for (let i = 0; i < 10; i++) {
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
    //const initialized = false;
    // 매 프레임 업데이트 //
    app.ticker.add(() => {
      let currentID = 0;
      graphics.clear();
      allCells.forEach((cell) => {
        if (!cell.state.inGroup && cell.closeCells.length > 2) {
          currentID += 1;
          cell.tryJoinGroup(currentID);
        }
        //console.log('this group ID: ', cell.state.groupID);
        cell.update(allCells);
      });

      //groupMap초기화//
      Group.groupByID(allCells, groupMap);
      groupMap.forEach((group) => {
        group.update();
        group.showGroupInterest(app.screen.width, 20);
      });
    });

    allCells.forEach((cell) => {
      cell.groupForce(0.5, groupMap);
    });

    console.log('Animation started');
  } catch (error) {
    console.error('Error creating Pixi app:', error);
  }
});
