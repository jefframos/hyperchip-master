import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import GameViewGraphics from 'loggie/core/view/GameViewGraphics';
export default class  PlayerSlot extends GameObject {
    constructor(){
        super()
    }
    build(){
        super.build();

        // const marker = (this.poolComponent(GameViewGraphics, true) as GameViewGraphics)
        // marker.view.lineStyle({color:0x00FF00, width:2}).drawCircle(0,0,30);
        // marker.customZIndex = 10
    }
    update(delta:number, unscaledTime:number){
        super.update(delta, unscaledTime);
    }
}