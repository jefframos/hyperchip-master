import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import BasePopUp from 'loggie/core/ui/popup/BasePopUp';
import { PopupConfig } from 'loggie/core/ui/popup/PopupConfig';
export default class  TestPopup extends BasePopUp {

    build(name: string, popupConfig: PopupConfig){
        super.build(name, popupConfig);


        // const test = new PIXI.Graphics().beginFill(0).drawCircle(0,0,300)
        // this.container.addChild(test)
        
    }
    update(delta:number, unscaledTime:number){
        super.update(delta, unscaledTime);
        // console.log(this.x)
    }

}