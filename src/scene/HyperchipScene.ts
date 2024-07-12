

import gsap from 'gsap';
import Loggie from 'loggie/core/Loggie';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import PopupManager from 'loggie/core/ui/popup/PopupManager';
import GameViewSprite from 'loggie/core/view/GameViewSprite';
import GameViewUtils from 'loggie/core/view/GameViewUtils';
import BaseScene from 'loggie/scene/BaseScene';
import BaseTemplates from 'loggie/templates/BaseTemplates';
import MathUtils from 'loggie/utils/MathUtils';
import ObjectCloner from 'loggie/utils/ObjectCloner';
import * as PIXI from 'pixi.js';
import fontManifest from '../manifest/font-manifest.json';
import imageManifest from '../manifest/image-manifest.json';
import jsonManifest from '../manifest/json-manifest.json';
import HyperchipGame from './HyperchipGame';
import TestPopup from './popup/TestPopup';
import TestPopup2 from './popup/TestPopup2';
export default class HyperchipScene extends BaseScene {

    private shapeBlocker!: GameViewSprite;
    constructor() {
        super()

    }
    setupLoading(): void {
        super.setupLoading([
            { src: 'images/', manifest: imageManifest },
            { src: 'json/', manifest: jsonManifest },
            { src: 'style/', manifest: fontManifest },
        ], ["template", "master"])
    }
    loadComplete(): void {
        this.shapeBlocker = GameViewUtils.makeSprite(this, PIXI.Texture.WHITE, RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.shapeBlocker.customZIndex = 1000000
        this.shapeBlocker.view.tint = 0x403eb8;



        // const tileset = PIXI.Assets.get('survive-props.json');
        // const tileset2 = PIXI.Assets.get('urban1tileset.json');
        // TilesetReader.instance.addTileset(tileset)
        // TilesetReader.instance.addTileset(tileset2)

        // WeaponLookup.instance.addEntityData(PIXI.Assets.get('weapons.json'))
        // WeaponLookup.instance.addEntityViewData(PIXI.Assets.get('weaponView.json'))
        // EntityLookup.instance.addEntityData(PIXI.Assets.get('entities.json'))
        // EntityLookup.instance.addEntityViewData(PIXI.Assets.get('entityView.json'))
        // EntityLookup.instance.addEntityData(PIXI.Assets.get('enemies.json'))
        // EntityLookup.instance.addEntityViewData(PIXI.Assets.get('enemyView.json'))


        this.baseGame = this.addNewGameObject(HyperchipGame, true)
        const testPopupManager = this.addNewGameObject(PopupManager, true, 0.5) as PopupManager
        const testPopup = this.addNewGameObject(TestPopup) as TestPopup
        testPopup.build('test', ObjectCloner.clone(BaseTemplates.PopupTemplate))
        testPopupManager.registerPopUp(testPopup)
        const testPopup2 = this.addNewGameObject(TestPopup2) as TestPopup2
        testPopup2.build('test2', ObjectCloner.clone(BaseTemplates.PopupTemplate))
        testPopupManager.registerPopUp(testPopup2)


        //testPopupManager.showPopUp('test')

        // setTimeout(() => {
        //     //testPopupManager.hideCurrentPopup()
        //     testPopupManager.showPopUp('test2')

        //     setTimeout(() => {
        //         testPopupManager.hideCurrentPopup()
        //         Loggie.TimeScale = 1

        //         //testPopupManager.showPopUp('test2')

        //     }, 2500);

        // }, 3500);



        Loggie.TimeScale = 0
        gsap.to(Loggie, { TimeScale: 1, duration: 0.5 })

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