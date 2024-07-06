import * as PIXI from 'pixi.js';

import Screen from 'loggie/screenManager/Screen';
import ScreenManager from 'loggie/screenManager/ScreenManager';
import TemplateScreen from './TemplateScreen';

export default class MainScreenManager extends ScreenManager {
    private screenContainer: PIXI.Container = new PIXI.Container();

    private testScreen: Screen;
    constructor() {
        super();
        //this.screensContainer = Game.ScreenManagerContainer;
        this.addChild(this.screenContainer);
        
        
        //this.addChild(test);


       // this.screenContainer.addChild(test)

        this.testScreen = new TemplateScreen('template');
        this.addScreen(this.testScreen);
        this.timeScale = 1;

        this.forceChange('template');

    }

    forceChange(screenLabel:string, param:any = {}) {

        super.forceChange(screenLabel, param);
    }
    change(screenLabel, param) {

        super.change(screenLabel, param);

    }
   
    update(delta) {
        super.update(delta * this.timeScale);
    }

    resize(newSize, innerResolution) {
        super.resize(newSize, innerResolution);
    }
}