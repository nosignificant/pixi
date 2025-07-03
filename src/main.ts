import * as PIXI from 'pixi.js';
import Cell from './Cell';
import BackCircle from './BackCircle';
import Group from './group';

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
    const groupMap = new Map<number, Cell[]>();

    let currentGroupId = 0;

    const backgroundContainer = new PIXI.Container();
    const graphics = new PIXI.Graphics();
    app.stage.addChild(backgroundContainer);
    app.stage.addChild(graphics);

    const b = new BackCircle(backgroundContainer);
    b.drawBackCircle(app.screen.width, 20);

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

    // 매 프레임 업데이트 //
    app.ticker.add(() => {
      allCells.forEach((cell) => {
        if (!cell.inGroup && cell.closeCells.length > 2) {
          currentGroupId += 1;
          cell.tryJoinGroup(currentGroupId);
        }
        //console.log('this group ID: ', cell.groupID);
        cell.update(allCells);
      });

      //groupMap초기화//
      Group.groupByID(allCells, groupMap);
      groupMap.forEach((group) => Group.drawGroupCellsLines(group, graphics));
    });

    console.log('Animation started');
  } catch (error) {
    console.error('Error creating Pixi app:', error);
  }
});
