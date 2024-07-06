import * as PIXI from 'pixi.js';
import GameObject from 'loggie/core/gameObject/GameObject';
import BaseComponent from 'loggie/core/gameObject/BaseComponent';
export default class  ShootKickback extends BaseComponent {
    kickback(angle:number, force:number){
        if(this.gameObject.rigidBody){           
            this.gameObject.rigidBody.inverseForce.x = Math.cos(angle) * force
            this.gameObject.rigidBody.inverseForce.z = Math.sin(angle) * force
        }else{
            console.log('nokick')
        }
    }
}