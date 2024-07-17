

import gsap from 'gsap';
import Loggie from 'loggie/core/Loggie';
import GameViewSprite from 'loggie/core/view/GameViewSprite';
import BaseScene from 'loggie/scene/BaseScene';
import MathUtils from 'loggie/utils/MathUtils';
import PromiseUtils from 'loggie/utils/promise/PromiseUtils';
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
        // this.shapeBlocker = GameViewUtils.makeSprite(this, PIXI.Texture.WHITE, RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        // this.shapeBlocker.customZIndex = 1000000
        // this.shapeBlocker.view.tint = 0x403eb8;

        this.baseGame = this.addNewGameObject(HyperchipGame, true)
        Loggie.TimeScale = 0
        gsap.to(Loggie, { TimeScale: 1, duration: 3, delau: 250 })

    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);


        if (this.loggie.mainCamera && this.shapeBlocker) {

            this.shapeBlocker.view.width = this.loggie.mainCamera.cameraViewBounds.width
            this.shapeBlocker.view.height = this.loggie.mainCamera.cameraViewBounds.height
            this.shapeBlocker.view.alpha = MathUtils.lerp(this.shapeBlocker.view.alpha, 0, 0.1)
        }
    }
}