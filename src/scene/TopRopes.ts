import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import ColorUtils from 'loggie/utils/color/ColorUtils';
import * as PIXI from 'pixi.js';
export default class TopRopes extends GameObject {
    private topContainer!: GameViewContainer;
    private points: PIXI.Point[] = [];
    private baseLength: number = 50
    private currentLength: number = 50
    private rope!: PIXI.SimpleRope
    constructor() {
        super()
    }
    build() {
        super.build();
        this.topContainer = this.poolComponent(GameViewContainer, true, RenderLayers.UILayerOverlay)

        this.baseLength = PIXI.Texture.from('rope').baseTexture.width / 20;
        this.points = [];
        for (let i = 0; i < 20; i++) {
            this.points.push(new PIXI.Point(i * this.baseLength, 0));
        }
        this.rope = new PIXI.SimpleRope(PIXI.Texture.from('rope'), this.points)
        this.rope.scale.set(0.5)
        this.topContainer.addChild(this.rope)


        this.x = -50
        this.z = 150

        this.currentLength = this.baseLength



    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);


        this.rope.tint = ColorUtils.interpolateGradient([{ color: 0x66A6FF, position: 0 }, { color: 0xF65EE8, position: 1 }], Math.sin(Loggie.Time * 2) * 0.5 + 0.5)

        this.currentLength = this.loggie.overlay.right / 20 / this.rope.scale.x//this.baseLength + Math.cos((Loggie.Time * 5)) * 30
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].y = Math.sin((i * 0.5) + (Loggie.Time * 8)) * 60;
            this.points[i].x = i * this.currentLength;
        }

        this.topContainer.customZIndex = -1

        if (this.rope) {
            this.rope.scale.set(this.loggie.overlay.right / this.baseLength * 0.02)
            // if (PIXI.isMobile.any) {
            this.z = 350 * this.rope.scale.x
            // } else {

            //     this.rope.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.right * 0.2, this.loggie.overlay.right * 0.2)))
        }
    }
}
