

import gsap from 'gsap';
import Loggie from 'loggie/core/Loggie';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewSprite from 'loggie/core/view/GameViewSprite';
import GameViewUtils from 'loggie/core/view/GameViewUtils';
import BaseScene from 'loggie/scene/BaseScene';
import MathUtils from 'loggie/utils/MathUtils';
import ColorUtils from 'loggie/utils/color/ColorUtils';
import PromiseUtils from 'loggie/utils/promise/PromiseUtils';
import * as PIXI from 'pixi.js';
import fontManifest from '../manifest/font-manifest.json';
import imageManifest from '../manifest/image-manifest.json';
import jsonManifest from '../manifest/json-manifest.json';
import HyperLoader from './HyperLoader';
import HyperchipGame from './HyperchipGame';
export default class HyperchipScene extends BaseScene {

    private shapeBlocker!: GameViewSprite;
    constructor() {
        super()
        this.loaderConstructor = HyperLoader

    }
    setupLoading(): void {
        super.setupLoading([
            { src: 'images/', manifest: imageManifest },
            { src: 'json/', manifest: jsonManifest },
            { src: 'style/', manifest: fontManifest },
        ], ["master"])
    }
    async loadComplete(): Promise<void> {
        this.baseLoader.destroy();
        await PromiseUtils.await(750);

        this.baseGame = this.addNewGameObject(HyperchipGame, true)
        this.shapeBlocker = GameViewUtils.makeSprite(this, PIXI.Texture.WHITE, RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.shapeBlocker.customZIndex = 1000000
        this.shapeBlocker.view.tint = 0x403eb8;
        Loggie.TimeScale = 0
        gsap.to(Loggie, { TimeScale: 1, duration: 3, delau: 250 })

    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);


        if (this.loggie.mainCamera && this.shapeBlocker) {

            this.shapeBlocker.view.tint = ColorUtils.interpolateGradient([{ color: 0x66A6FF, position: 0 }, { color: 0xF65EE8, position: 1 }], Math.sin(Loggie.Time * 2) * 0.5 + 0.5)
            this.shapeBlocker.gameObject.x = 0
            this.shapeBlocker.view.width = this.loggie.overlay.right + 5
            this.shapeBlocker.view.height = this.loggie.overlay.down + 5
            this.shapeBlocker.view.alpha = MathUtils.lerp(this.shapeBlocker.view.alpha, 0, 0.01)
        }
    }
}