import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import GameViewGraphics from 'loggie/core/view/GameViewGraphics';
export default class  WorldPointsDebug extends GameObject {
    constructor(){
        super()
    }
    build(w:integer = 20, h:integer = 25){
        super.build();

        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                const g = this.poolGameObject(GameObject)
                g.poolComponent(GameViewGraphics, true).view.beginFill(0x0000ff).drawCircle(0, 0, 5)
                g.x = i * 150 - (w * 150 / 2)
                g.z = j * 150 - (h * 150 / 2)
            }

        }
    }
    update(delta:number, unscaledTime:number){
        super.update(delta, unscaledTime);
    }
}