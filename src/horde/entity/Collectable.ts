import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import GameEntity from '../../shared/entity/GameEntity';
import { Signal } from 'signals';
export default class  Collectable extends GameEntity {
    protected width:number = 200;
    protected height:number = 150;
    public onCollectEntity: Signal = new Signal();

    build(width: number, height:number = 150): void {
        this.width = width;
        this.height = height;
        super.build()

    }
}