import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewSprite from 'loggie/core/view/GameViewSprite';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
export default class EntityDirectionIndicator extends GameObject {
    private container!: GameViewContainer;
    private sprite: PIXI.Sprite = new PIXI.Sprite();
    build() {
        super.build();

        this.container = this.poolComponent(GameViewContainer)
        this.container.layer = RenderLayers.Ground;

        this.sprite.texture = PIXI.Texture.from('direction_marker')
        this.sprite.anchor.set(0.5)
        this.sprite.scale.set(0.5)

        this.container.addChild(this.sprite)
        this.container.viewScale.set(1,0.65)

    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);
        
        if(!this.parent){
            return;
        }
        this.sprite.rotation = this.parent.transform.angle;
    }
}
