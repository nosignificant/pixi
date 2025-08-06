import * as PIXI from 'pixi.js';
import BackCoord from './libs/BackCoord';
import Simulation from './Simulation';

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
    const slice = 20;
    const boxWidth = pixiContainer.clientWidth / slice;
    console.log(pixiContainer.clientWidth, boxWidth);

    const graphics = new PIXI.Graphics();
    app.stage.addChild(graphics);
    BackCoord.drawBackCoord(pixiContainer.clientWidth, 20);
    const sim = new Simulation(app, boxWidth);

    app.ticker.add(() => {
      sim.step();
    });

    console.log('Animation started');
  } catch (error) {
    console.error('Error creating Pixi app:', error);
  }
});
