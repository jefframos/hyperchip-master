import LoggieApplication from 'loggie/LoggieApplication';
import GameObject from 'loggie/core/gameObject/GameObject';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import * as PIXI from 'pixi.js';
export default class FloorTexture extends GameObject {
    private renderTexture!: PIXI.RenderTexture;
    private renderTextureSprite!: PIXI.Sprite;
    private container!: GameViewContainer;
    private bloods: PIXI.Sprite[] = []
    constructor() {
        super()
        this.renderTexture = PIXI.RenderTexture.create({ width: 2048, height: 2048 });
        this.renderTextureSprite = new PIXI.Sprite(this.renderTexture);

        const bloods = ['bloods (1)', 'bloods (2)', 'bloods (3)', 'bloods (4)', 'bloods (5)', 'bloods (6)', 'bloods (7)', 'bloods (8)', 'bloods (9)']
        bloods.forEach(element => {

            this.bloods.push(PIXI.Sprite.from(element))
        });
    }
    build() {
        super.build();
        //
        //this.rt = PIXI.RenderTexture.create({ width: 1500, height: 1500 });

        // const test = this.poolGameObject(GameObject, true) as GameObject;
        this.container = this.poolComponent(GameViewContainer, true, RenderLayers.Shadow) as GameViewContainer
        this.container.ignoreCameraPerspective = true;
        this.container.addChild(this.renderTextureSprite)
        this.renderTextureSprite.scale.set(1)
        const sprite = PIXI.Sprite.from('testTexture2.png')

        // // const spriteErase = PIXI.Sprite.from('shadow.png')
        // // spriteErase.position.set(150,0)
        // // spriteErase.blendMode = PIXI.BLEND_MODES.ERASE;

        LoggieApplication.app.renderer.render(sprite, { renderTexture: this.renderTexture, clear: false });
        sprite.y = 2048 - 50
        LoggieApplication.app.renderer.render(sprite, { renderTexture: this.renderTexture, clear: false });
        // LoggieApplication.app.renderer.render(sprite, { renderTexture: this.renderTexture, clear: false });
        // LoggieApplication.app.renderer.render(sprite, { renderTexture: this.renderTexture, clear: false });
        // LoggieApplication.app.renderer.render(sprite, { renderTexture: this.renderTexture, clear: false });
        // LoggieApplication.app.renderer.render(sprite, { renderTexture: this.renderTexture, clear: false });

        // const renderTextureSprite = new PIXI.Sprite(this.rt);
        // //renderTextureSprite.anchor.set(0.5)
        // container.addChild(renderTextureSprite)
        // renderTextureSprite.x = 0
        // renderTextureSprite.y = 0
        // // // test.x = 500
        // // test.y = 500
        // // panel.layer = RenderLayers.FrontLayer
        // // panel.customZIndex = -50000

        // //console.log(this.dropPanel)
        this.x = -1024
        this.z = -1024

    }
    stampBlood(sprite: PIXI.Sprite) {
        const spritePos = this.container.view.toLocal(sprite.getGlobalPosition())
        const blood = this.bloods[Math.floor(Math.random() * this.bloods.length)]
        blood.anchor.set(1, 1)
        blood.scale.set(0.25 * sprite.scale.x)
        blood.position.set(spritePos.x, spritePos.y)
        LoggieApplication.app.renderer.render(blood, { renderTexture: this.renderTexture, clear: false });
    }
    stamp(sprite: PIXI.Sprite) {

        const spritePos = this.container.view.toLocal(sprite.getGlobalPosition())
        sprite.position.set(spritePos.x / this.renderTextureSprite.scale.x, spritePos.y / this.renderTextureSprite.scale.y)
        //sprite.scale.set(1 / this.renderTextureSprite.scale.x)
        LoggieApplication.app.renderer.render(sprite, { renderTexture: this.renderTexture, clear: false });
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);
    }
}