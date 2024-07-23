import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import MathUtils from 'loggie/utils/MathUtils';
import * as PIXI from 'pixi.js';
export default class TopRopes extends GameObject {
    private topContainer!: GameViewContainer;
    private points: PIXI.Point[] = [];
    private baseLength: number = 50
    public currentLength: number = 50
    private rope!: PIXI.SimpleRope
    private isStraight: boolean = false;
    constructor() {
        super()
    }
    build(texture: PIXI.Texture) {
        super.build();
        this.topContainer = this.poolComponent(GameViewContainer, true, RenderLayers.UILayerOverlay)

        this.baseLength = texture.baseTexture.width / 20;
        this.points = [];
        for (let i = 0; i < 30; i++) {
            this.points.push(new PIXI.Point(i * this.baseLength, 0));
        }
        this.rope = new PIXI.SimpleRope(texture, this.points)
        this.rope.scale.set(0.5)
        this.topContainer.addChild(this.rope)


        this.x = 0
        this.z = 0

        this.currentLength = this.baseLength



    }

    straighten() {
        this.isStraight = true;
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);


        this.rope.tint = 0xF65EE8//ColorUtils.interpolateGradient([{ color: 0x66A6FF, position: 0 }, { color: 0xF65EE8, position: 1 }], Math.sin(Loggie.Time * 2) * 0.5 + 0.5)

        //this.currentLength = this.loggie.overlay.right / 20 / this.rope.scale.x//this.baseLength + Math.cos((Loggie.Time * 5)) * 30

        const l = this.currentLength / this.points.length / this.rope.scale.x
        for (let i = 0; i < this.points.length; i++) {
            if (this.isStraight) {

                this.points[i].x = MathUtils.lerp(this.points[i].x, 0, 0.2) //Math.sin((i * 0.5) + (Loggie.Time * 8)) * Math.max(50, Math.min(120, 800 - this.currentLength));
            } else {

                this.points[i].x = Math.sin((i * 0.5) + (Loggie.Time * 8)) * Math.max(50, Math.min(120, 800 - this.currentLength));
            }
            this.points[i].y = i * l + l / 2;
        }

        this.topContainer.customZIndex = -1

        // if (this.rope) {
        //     this.rope.scale.set(this.loggie.overlay.right / this.baseLength * 0.02)
        //     // if (PIXI.isMobile.any) {
        //     this.z = 350 * this.rope.scale.x
        //     // } else {

        //     //     this.rope.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.right * 0.2, this.loggie.overlay.right * 0.2)))
        // }
    }
}
