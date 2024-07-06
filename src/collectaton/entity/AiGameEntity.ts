import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import GameEntity from '../../shared/entity/GameEntity';
import AiBehaviour from './components/AiBehaviour';
export default class AiGameEntity extends GameEntity {
    public aiBehaviour!: AiBehaviour;
    constructor() {
        super()
    }
    build() {
        super.build();
        this.aiBehaviour = this.poolComponent(AiBehaviour, true)
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);        
        //this.textField.text = this.aiBehaviour.value//this.rigidBody.body.isSensor//this.rigidBody.layerCategory +' - '+ this.rigidBody.layerMask+' - '+ this.health.getCurrentHealth() +' - '+ this.rigidBody.layerCategory;

    }
}