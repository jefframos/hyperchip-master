import * as PIXI from 'pixi.js';

import Loggie from 'loggie/core/Loggie';
import PerspectiveCamera from 'loggie/core/camera/PerspectiveCamera';
import RenderModule from 'loggie/core/render/RenderModule';
import Screen from "loggie/screenManager/Screen";
import TestEntity from '../TestEntity';
import Vector3 from 'loggie/core/gameObject/Vector3';
import GameEntity from '../entity/GameEntity';
import Button from './Button';

export default class TestScreen extends Screen {

    private container: PIXI.Container = new PIXI.Container()
    private gameplayContainer: PIXI.Container = new PIXI.Container()
    private effectsContainer: PIXI.Container = new PIXI.Container()
    private uiContainer: PIXI.Container = new PIXI.Container()
    private sideContainer: PIXI.Container = new PIXI.Container()
    private centerContainer: PIXI.Container = new PIXI.Container()
    private loggie: Loggie = new Loggie();
    public allData: any;
    private combinationsMade: any[] = [];
    private combinationsButtons: Button[] = [];
    private onScreenButton: Button[] = [];
    private count:number = 0
    constructor(screenName: string) {
        super(screenName);

        this.addChild(this.container);


        const test = new PIXI.Graphics().beginFill(0xFF0000).drawCircle(0, 0, 200)
        //this.addChild(test)

        this.container.addChild(this.gameplayContainer)
        this.container.addChild(this.effectsContainer)
        this.container.addChild(this.uiContainer)
        this.container.addChild(this.sideContainer)
        this.container.addChild(this.centerContainer)



        this.loggie.addGameObject(new RenderModule(this.gameplayContainer, this.uiContainer, this))
        //this.inputModule = this.loggie.addGameObject(new InputModule(this))
        //this.effectsManager = this.loggie.addGameObject(new EffectsManager(this.effectsContainer, this.gameplayContainer))
        this.camera = this.loggie.addCamera(new PerspectiveCamera())

        this.camera.setFollowPoint(new Vector3())


    }
    updateButtons() {
        this.combinationsMade.forEach(element => {
            let found = this.combinationsButtons.some(obj => obj.data.result
                === element.result
            );
            if (!found) {
                this.addButton(element)
            }
        });
    }
    addButton(data) {
        const btn = this.loggie.poolGameObject(Button) as Button
        btn.build(data)
        this.combinationsButtons.push(btn)

        this.sideContainer.addChild(btn.gameView.view)
        
        btn.onClick.add(()=>{
            this.cloneButton(btn.data)
        })
        
        let numRows = Math.ceil(this.combinationsButtons.length / 2); // Calculate the number of rows needed
        let buttonWidth = 150;
        let buttonHeight = 60;
        let padding = 20;
        
        for (let i = 0; i < this.combinationsButtons.length; i++) {
            let row = Math.floor(i / 2);
            let col = i % 2;
            let x = col * (buttonWidth + padding) + padding;
            let y = row * (buttonHeight + padding) + padding;
            this.combinationsButtons[i].x = x
            this.combinationsButtons[i].z = y
        }
    }
    checkCollisions(draggedButton) {
        for (let i = 0; i < this.onScreenButton.length; i++) {
            let button = this.onScreenButton[i];
            if (button !== draggedButton && this.areColliding(button.gameView.view, draggedButton.gameView.view)) {
                return button
            }
        }
        return false
    }

    areColliding(obj1, obj2) {
        console.log(obj1, obj2)
        return (
            obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y
        );
    }
    cloneButton(data){
        const btn = this.loggie.poolGameObject(Button) as Button
        btn.build(data, true)
        this.onScreenButton.push(btn)
        this.centerContainer.addChild(btn.gameView.view)

        this.count ++

        btn.x = Math.sin(this.count * 0.5) * 120
        btn.z = Math.cos(this.count * 0.5) * 120

        btn.onDragOver.add(()=>{
            this.findCombinations(btn,btn.data)
        })

        return btn
    }
    findCombination(ingredient1, ingredient2) {
        for (let i = 0; i < this.allData.combinations.length; i++) {
            const combination = this.allData.combinations[i];
            const ingredients = combination.ingredients;
    
            // Check if the current combination matches the ingredients
            if ((ingredients[0] === ingredient1 && ingredients[1] === ingredient2) ||
                (ingredients[1] === ingredient1 && ingredients[0] === ingredient2)) {
                return combination;
            }
        }
        
        // Return null if no combination found
        return null;
    }
    findCombinations(btn,data){
        const collision = this.checkCollisions(btn);
        if(collision){
            const result = this.findCombination(collision.data.result, data.result)
            if(result){
                let b1 = this.onScreenButton.indexOf(collision)
                this.onScreenButton.splice(b1,1)

                this.centerContainer.removeChild(collision.gameView.view)
                b1 = this.onScreenButton.indexOf(btn)
                this.onScreenButton.splice(b1,1)
                this.centerContainer.removeChild(btn.gameView.view)

                const newButton = this.cloneButton(result)
                newButton.x = collision.x
                newButton.z = collision.z
            }
        }
    }
    build(param) {
        super.build();
        this.loggie.start();
        //this.worldRender = this.gameEngine.addGameObject(new EnvironmentManager());
        // this.map = this.gameEngine.poolGameObject(BaseMap, true)

        this.allData = PIXI.Assets.get('json/combinations.json')
        for (let index = 0; index < 4; index++) {
            this.combinationsMade.push(this.allData.combinations[index])
        }

        this.updateButtons()
        // let entity = this.loggie.poolGameObject(TestEntity, true)
        // entity.x = 200
        // entity.z = 200
        // let entity2 = this.loggie.poolGameObject(TestEntity2, true) as TestEntity2
        // entity2.rigidBody.x = 500
        // entity2.rigidBody.z = 200

        // this.camera.setFollowPoint(entity)

        //     var local = this.gameplayContainer.toLocal(position)
        //     entity.x = local.x
        //     entity.z = local.y

        // this.map.onMapUp.add((position) => {
        //     let entity = this.gameEngine.poolGameObject(BaseUnit, true)

        //     var local = this.gameplayContainer.toLocal(position)
        //     entity.x = local.x
        //     entity.z = local.y
        // })

        // this.camera.setFollowPoint(this.map.mapCenter)
    }
    update(delta) {
        const timeScale = 1.25

        // if (this.map) {
        //     var zoom = Utils.scaleToFitDimensions(this.map.dimensions, Game.Borders)
        //     this.camera.targetZoom = zoom

        //     this.camera.setFollowPoint(this.map.mapCenter)

        // }

        this.camera.targetZoom = 1

        const debugTimeScale = 1//Game.Debug.timeScale | 1
        const scaledTime = delta * debugTimeScale * timeScale;
        delta *= debugTimeScale;
        // this.loggie.update(scaledTime, delta * debugTimeScale)
        //console.log(delta)

        this.centerContainer.x = window.innerWidth / 2-75
        this.centerContainer.y = window.innerHeight / 2

        this.sideContainer.x = window.innerWidth - 380
        console.log(this.centerContainer.x)
        this.loggie.update(delta, delta)

    }

    // transitionOut(nextScreen, params) {
    //     this.nextScreen = nextScreen;
    //     super.transitionOut(nextScreen, params,0.1);
    // }

}