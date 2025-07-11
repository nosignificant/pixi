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

    const backgroundContainer = new PIXI.Container();
    const graphics = new PIXI.Graphics();
    app.stage.addChild(graphics);
    app.stage.addChild(backgroundContainer);

    const b = new BackCircle();
    b.drawBackCircle(app.screen.width, 20);
    BackCoord.drawBackCoord(app.screen.width, 20);

    b.dots.forEach((dot) => backgroundContainer.addChild(dot));

    console.log('cell initialize');
    for (let i = 0; i < 20; i++) {
      const offsetX = Math.floor(Math.random() * 100);
      const offsetY = Math.floor(Math.random() * 100);
      const cell = new Cell(100 + i * 50 - offsetX, 100 + i * 50 - offsetY);
      allCells.push(cell);
      app.stage.addChild(cell.graphic);
      // 초기 위치 설정
      cell.graphic.x = cell.point.x;
      cell.graphic.y = cell.point.y;
    }
    let initialized = false;
    // 매 프레임 업데이트 //
    app.ticker.add(() => {
      graphics.clear();
      allCells.forEach((cell) => {
        if (!cell.state.inGroup && cell.closeCells.length > 2) {
          Group.currentId += 1;
          cell.tryJoinGroup(Group.currentId);
        }
        //console.log('this group ID: ', cell.groupID);
        cell.update(allCells);
      });

      //groupMap초기화//

      if (!initialized && Group.currentId !== 0) {
        Group.groupByID(allCells);
        Group.groupInterestArr();
        initialized = true;
        console.log('init: ', initialized);
      }
      Group.groupByID(allCells);

      Group.drawGroupCellsLines(graphics);
      Group.showGroupInterest(app.screen.width, 20, graphics);

      Group.update();
    });

    console.log('Animation started');
  } catch (error) {
    console.error('Error creating Pixi app:', error);
  }
});
