import * as PIXI from 'pixi.js';
import GameEntity from '../../shared/entity/GameEntity';
import AiBehaviour from './components/AiBehaviour';
export default class Companion extends GameEntity {
    public aiBehaviour!: AiBehaviour;
    constructor() {
        super()
    }
    build() {
        super.build();
        this.aiBehaviour = this.poolComponent(AiBehaviour, true)
        this.textField.text = 2;

    }
    afterBuild(): void {
        super.afterBuild();
        this.setAsPlayer();
    }
}