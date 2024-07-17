import gsap from "gsap";
import LoggieApplication from "loggie/LoggieApplication";
import { RenderLayers } from "loggie/core/render/RenderLayers";
import GameViewContainer from "loggie/core/view/GameViewContainer";
import GameViewSprite from "loggie/core/view/GameViewSprite";
import SceneLoaderView from "loggie/scene/SceneLoaderView";
import MathUtils from "loggie/utils/MathUtils";
import * as PIXI from 'pixi.js';
import TopRopes from "./TopRopes";

export default class HyperLoader extends SceneLoaderView {
    private rope?: TopRopes;
    private currentProgress: number = 0
    public blocker!: GameViewSprite;

    constructor() {
        super()
        // this.text = new PIXI.Text();
        // this.text.style.fill = 0xFFFFFF
    }
    public build(...data: any[]): void {
        super.build();

        this.container = this.addNewComponent(GameViewContainer, true)
        this.container.layer = RenderLayers.UILayerOverlay;
        //this.text.anchor.set(0.5)
        //this.container.addChild(this.text)

        this.rope = this.poolGameObject(TopRopes, true, this.createRoundedRectTexture(768, 64, 0));
        this.rope.currentLength = 0
        this.blocker = this.poolComponent(GameViewSprite, true, RenderLayers.UILayerOverlay, PIXI.Texture.WHITE)
        this.blocker.view.scale.set(5000)
        this.blocker.view.anchor.set(0.5)
        this.blocker.view.alpha = 0
        this.blocker.view.tint = 0x403eb8

    }
    createRoundedRectTexture(width: number, height: number, radius: number): PIXI.Texture {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF); // Fill color (red)
        graphics.drawRoundedRect(0, 0, width, height, radius);
        graphics.endFill();

        // Generate a texture from the graphics object
        const texture = LoggieApplication.app.renderer.generateTexture(graphics);
        // Optionally, destroy the graphics object to free up memory
        graphics.destroy();

        return texture;
    }
    public updateProgress(progress: number) {
        //this.text.text = Math.floor(progress * 100).toString() + '%'
        this.currentProgress = progress;
    }
    update(delta: number, unscaledDelta: number): void {
        super.update(delta, unscaledDelta)
        this.x = this.loggie.overlay.halfWidth
        this.z = this.loggie.overlay.down - 100

        if (this.rope) {
            this.rope.y = -150
            const targetLength = (this.loggie.overlay.down + 300) * this.currentProgress
            this.rope.x = this.loggie.overlay.halfWidth
            this.rope.currentLength = MathUtils.lerp(this.rope.currentLength, Math.max(300, targetLength), 0.1)
            console.log(this.currentProgress)
            this.blocker.view.tint = this.rope.rope.tint
        }

    }
    destroy(): void {
        gsap.to(this.blocker.view, {
            alpha: 1, duration: 0.5, delay: 0.25, onComplete: () => {
                this.rope?.destroy();
                this.rope = undefined;
                gsap.to(this.blocker.view, {
                    alpha: 0, duration: 0.5, onComplete: () => {
                        super.destroy();
                    }
                })
            }
        })

    }
}
