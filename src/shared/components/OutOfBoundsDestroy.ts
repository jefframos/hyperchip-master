import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import BaseComponent from 'loggie/core/gameObject/BaseComponent';
export default class  OutOfBoundsDestroy extends BaseComponent {
    private expandWidth:number = 0
    private expandHeight:number = 0
    private radius:number = 80
    constructor(){
        super()
    }
    build(expandWidth:number = 0, expandHeight:number = 0, radius:number){
        super.build();
        this.expandWidth = expandWidth;
        this.expandHeight = expandHeight;
        this.radius = radius;
    }
    update(delta:number, unscaledTime:number){
        super.update(delta, unscaledTime);
        
        this.loggie.mainCamera.expandedBoundCheck.expandX = this.expandWidth
        this.loggie.mainCamera.expandedBoundCheck.expandY = this.expandHeight
        if (!this.loggie.mainCamera.expandedBoundCheck.circlePartiallyInCameraBounds(this.gameObject.x, this.gameObject.z, this.radius)) {
           this.gameObject.destroy()
           // console.log(this.gameObject.components)
        }
    }
}