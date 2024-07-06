import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import GameViewTiledSprite from 'loggie/core/view/GameViewTiledSprite';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
export default class  Ground extends GameObject {
    private groundSprite!:GameViewTiledSprite;
    constructor(){
        super()
    }
    build(){
        super.build();

        this.groundSprite = this.poolComponent(GameViewTiledSprite, true)
        this.groundSprite.layer = RenderLayers.Base;
        this.groundSprite.view.texture = PIXI.Texture.from('forestpack_grass_light_leaf_1_tile_diffuse')
        this.groundSprite.view.anchor.set(0.5)
        //this.groundSprite.view.alpha = 0.2
        this.groundSprite.view.tileScale.set(25)
    }
    update(delta:number, unscaledTime:number){
        super.update(delta, unscaledTime);

        this.groundSprite.view.width = this.loggie.mainCamera.cameraViewBounds.width
        this.groundSprite.view.height = this.loggie.mainCamera.cameraViewBounds.height

        this.groundSprite.view.tilePosition.x = -this.loggie.mainCamera.cameraViewBounds.center.x
        this.groundSprite.view.tilePosition.y = -this.loggie.mainCamera.cameraViewBounds.center.y

        this.x = this.loggie.mainCamera.cameraViewBounds.center.x
        this.z = this.loggie.mainCamera.cameraViewBounds.center.y
    }
}