import ObjectCloner from 'loggie/utils/ObjectCloner';
import * as PIXI from 'pixi.js';
export class Fonts {
    private static _mainStyle: PIXI.TextStyle = new PIXI.TextStyle({
        fontFamily: 'renogare-regular-webfont',
        fill: 0xFFFFFF,
        stroke: 0,
        strokeThickness: 4
    })
    static get mainStyle(): PIXI.TextStyle {
        return ObjectCloner.clone(this._mainStyle);
    }

}