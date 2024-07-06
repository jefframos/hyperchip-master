import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewSprite from "loggie/core/view/GameViewSprite";
import * as PIXI from 'pixi.js';

export default class EntityShadow extends GameViewSprite {
    build(texture: PIXI.Texture, size: number = 30) {
        super.build(RenderLayers.Floor, texture)
        this.view.tint = 0
        this.view.alpha = 0
        this.view.anchor.set(0.5)
        const scl = size / texture.width
        this.viewScale.set(scl, scl * 0.5)
    }
    public afterBuild(): void {
        super.afterBuild();
        this.view.alpha = 0.5
    }
}