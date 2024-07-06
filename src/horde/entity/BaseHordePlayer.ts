import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import InputControlledPhysicObject from 'loggie/core/input/InputControlledPhysicObject';
import GameEntity from '../../shared/entity/GameEntity';
export default class  BaseHordePlayer extends GameEntity {
    constructor(){
        super()
    }
    build() {
        super.build();
        this.poolComponent(InputControlledPhysicObject, true, 8);
        this.setAsPlayer();
    }
    afterBuild(): void {
        this.spriteView.view.visible = true;
    }
    update(delta:number, unscaledTime:number){
        super.update(delta, unscaledTime);
    }
}