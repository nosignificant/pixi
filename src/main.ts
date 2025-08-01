import * as PIXI from 'pixi.js';
import Cell from './Cell';
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

    // 셀 초기화 //
    console.log('cell initialize');
    let cellID = 0;
    for (let i = 0; i < 20; i++) {
      const offsetX = Math.floor(Math.random() * 100);
      const offsetY = Math.floor(Math.random() * 100);
      const cell = new Cell(
        100 + i * 100 - offsetX,
        100 + i * 100 - offsetY,
        cellID
      );
      allCells.push(cell);
      app.stage.addChild(cell.graphic);
      // 초기 위치 설정
      cell.graphic.x = cell.point.x;
      cell.graphic.y = cell.point.y;
      cellID += 1;
    }

    // 그룹 생성 + 셀 배정 //
    const cellsPerGroup = 4;
    let groupID = 0;

    for (let i = 0; i < allCells.length; i += cellsPerGroup) {
      const group = new Group(groupID, groupMap);

      const slice = allCells.slice(i, i + cellsPerGroup);
      slice.forEach((cell) => {
        cell.state.groupID = groupID;
        cell.state.inGroup = true;
        group.cells.push(cell);
      });

      groupMap.set(groupID, group);
      app.stage.addChild(group.graphic);

      groupID++;
    }
    app.ticker.add(() => {
      graphics.clear();

      groupMap.forEach((group) => {
        group.getGroupMap(groupMap);
        group.update(groupMap);
        group.groupDraw(pixiContainer.clientWidth, 20);
      });
      allCells.forEach((cell) => {
        cell.groupForce(1, groupMap);
        cell.update();
        cell.draw();
      });
    });

    console.log('Animation started');
  } catch (error) {
    console.error('Error creating Pixi app:', error);
  }
});
