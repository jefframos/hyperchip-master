

import gsap from 'gsap';
import Loggie from 'loggie/core/Loggie';
import PopupManager from 'loggie/core/ui/popup/PopupManager';
import BaseScene from 'loggie/scene/BaseScene';
import BaseTemplates from 'loggie/templates/BaseTemplates';
import ObjectCloner from 'loggie/utils/ObjectCloner';
import fontManifest from '../manifest/font-manifest.json';
import imageManifest from '../manifest/image-manifest.json';
import jsonManifest from '../manifest/json-manifest.json';
import TestPopup from '../scene/popup/TestPopup';
import TestPopup2 from '../scene/popup/TestPopup2';
import GoblinGame from './GoblinGame';

export default class GoblinScene extends BaseScene {

    constructor() {
        super()

    }
    setupLoading(): void {
        super.setupLoading([
            { src: 'images/', manifest: imageManifest },
            { src: 'json/', manifest: jsonManifest },
            { src: 'style/', manifest: fontManifest },
        ], ["template", "goblin"])
    }
    loadComplete(): void {





        this.baseGame = this.addNewGameObject(GoblinGame, true)
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
    }
}