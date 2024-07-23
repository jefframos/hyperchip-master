import gsap from "gsap";
import LoggieApplication from "loggie/LoggieApplication";
import { RenderLayers } from "loggie/core/render/RenderLayers";
import GameViewContainer from "loggie/core/view/GameViewContainer";
import GameViewSprite from "loggie/core/view/GameViewSprite";
import GameViewUtils from "loggie/core/view/GameViewUtils";
import SceneLoaderView from "loggie/scene/SceneLoaderView";
import MathUtils from "loggie/utils/MathUtils";
import * as PIXI from 'pixi.js';
import TopRopes from "./TopRopes";

export default class HyperLoader extends SceneLoaderView {
    private rope?: TopRopes;
    private currentProgress: number = 0
    public blocker!: GameViewSprite;
    public destroying: boolean = false;
    public exiting: boolean = false;


    private shapeBlockerLeft!: GameViewSprite;



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

        if (this.exiting) {
            if (this.shapeBlockerLeft) {
                this.shapeBlockerLeft.view.width = this.loggie.overlay.right + 150
                this.shapeBlockerLeft.view.height = this.loggie.overlay.down + 500


                this.shapeBlockerLeft.view.alpha = MathUtils.lerp(this.shapeBlockerLeft.view.alpha, 0, 0.02)

            }
        }
        if (this.rope) {
            this.rope.y = -150
            const targetLength = (this.loggie.overlay.down + 300) * this.currentProgress
            this.rope.x = this.loggie.overlay.halfWidth
            this.rope.currentLength = MathUtils.lerp(this.rope.currentLength, Math.max(300, targetLength), 0.1)
            this.blocker.view.tint = 0xF65EE8//ColorUtils.interpolateGradient([{ color: 0x66A6FF, position: 0 }, { color: 0xF65EE8, position: 1 }], Math.sin(Loggie.Time * 2) * 0.5 + 0.5)

            if (this.destroying) {
                this.rope.straighten()
            }
        }
    }
    destroy(): void {
        this.destroying = true
        this.blocker.view.alpha = 1
        this.blocker.view.scale.x = 0

        gsap.to(this.blocker.view.scale, {
            delay: 0.5, duration: 0.3, x: 200, onComplete: () => {
                this.exit()
                setTimeout(() => {
                    super.destroy();
                }, 5000);
            }
        });

    }
    exit() {
        this.exiting = true;
        this.rope?.destroy();
        this.rope = undefined;
        this.blocker.view.alpha = 0

        this.shapeBlockerLeft = GameViewUtils.makeSprite(this, PIXI.Texture.WHITE, RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.shapeBlockerLeft.customZIndex = 1000000
        this.shapeBlockerLeft.view.tint = 0xF65EE8;
        this.shapeBlockerLeft.gameObject.x = 0



    }
}
