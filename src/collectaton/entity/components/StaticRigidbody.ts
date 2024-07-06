import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import RigidBody from 'loggie/core/physics/RigidBody';
import GameViewGraphics from 'loggie/core/view/GameViewGraphics';
import { PhysicsLayers } from 'loggie/core/physics/PhysicsLayers';
export default class  StaticRigidbody extends GameObject {
    constructor(){
        super()
    }
    build(){
        super.build();
        this.rigidBody = this.poolComponent(RigidBody) as RigidBody;
        this.rigidBody.buildCircle(35,true)
        this.rigidBody.layerCategory = PhysicsLayers.Environment
        this.rigidBody.body.isStatic = true;
        this.debug = this.poolComponent(GameViewGraphics);
        this.debug.view.lineStyle({ color: 0xFFFFFF, width: 5 }).drawCircle(0, 0, this.rigidBody.body.circleRadius)
    }
    buildCircle(radius:number){
        this.rigidBody = this.poolComponent(RigidBody) as RigidBody;
        this.rigidBody.buildCircle(radius,true)
        this.rigidBody.layerCategory = PhysicsLayers.Environment
        this.rigidBody.body.isStatic = true;
        this.debug = this.poolComponent(GameViewGraphics);
        this.debug.view.lineStyle({ color: 0xFFFFFF, width: 5 }).drawCircle(0, 0, this.rigidBody.body.circleRadius)
    }
    update(delta:number, unscaledTime:number){
        super.update(delta, unscaledTime);

    }
}