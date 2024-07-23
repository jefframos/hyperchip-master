

import gsap from 'gsap';
import Loggie from 'loggie/core/Loggie';
import BaseScene from 'loggie/scene/BaseScene';
import PromiseUtils from 'loggie/utils/promise/PromiseUtils';
import fontManifest from '../manifest/font-manifest.json';
import imageManifest from '../manifest/image-manifest.json';
import jsonManifest from '../manifest/json-manifest.json';
import HyperLoader from './HyperLoader';
import HyperchipGame from './HyperchipGame';
export default class HyperchipScene extends BaseScene {

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
        await PromiseUtils.await(800);

        this.baseGame = this.addNewGameObject(HyperchipGame, true)

        Loggie.TimeScale = 0
        gsap.to(Loggie, { TimeScale: 1, duration: 3, delay: 0.5 })

    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

    }
}