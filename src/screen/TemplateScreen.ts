import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import Screen from 'loggie/screenManager/Screen';
import RenderModule from 'loggie/core/render/RenderModule';
import PerspectiveCamera from 'loggie/core/camera/PerspectiveCamera';
import Vector3 from 'loggie/core/gameObject/Vector3';
import Camera from 'loggie/core/camera/Camera';
import GameEntity from '../entity/GameEntity';
import Button from './Button';
import LoggieApplication from 'loggie/LoggieApplication';
import AnalogInput from 'loggie/core/input/AnalogInput';
import InputControlledPhysicObject from 'loggie/core/input/InputControlledPhysicObject';
import GameViewGraphics from 'loggie/core/view/GameViewGraphics';
import GameBoard from 'loggie/gameSystems/match3system/system/GameBoard';
import BoardView from 'loggie/gameSystems/match3system/view/BoardView';
import Match3Controller from 'loggie/gameSystems/match3system/controller/Match3Controller';
import AssetLoaderService from '../grid/AssetLoadService';
import GuiDebugger from 'loggie/core/debug/GuiDebugger';
import StaticRigidbody from '../entity/components/StaticRigidbody';
import WeaponLookup from '../data/weapon/WeaponLookup';
import BaseWeapon from '../entity/components/BaseWeapon';
import { WeaponEnum } from '../data/weapon/WeaponEnum';
import TwinStickControlledPhysicObject from 'loggie/core/input/twinStick/TwinStickControlledPhysicObject';
import GameWorldView from '../game/GameWorldView';
import EntityMergerManager from '../game/EntityMergerManager';
import GameSessionController from '../game/GameSessionController';
import SessionPlayerData from '../game/data/SessionPlayerData';
import TiledReader from '../data/tiled/TiledReader';
import TiledStaticGameEntity from '../entity/TiledStaticGameEntity';
import Pool from 'loggie/core/utils/Pool';

export default class TemplateScreen extends Screen {
    private container: PIXI.Container = new PIXI.Container()

    private gameBoard: GameBoard = new GameBoard(6, 6);
    private boardView: BoardView;
    private boardController!: Match3Controller;

    private gameplayContainer: PIXI.Container = new PIXI.Container()
    private loggie: Loggie;
    private player: GameEntity;
    private activeWeapon!: BaseWeapon;
    private gameWorldView!: GameWorldView;
    private gameplayManager: EntityMergerManager = new EntityMergerManager();
    private surviveSessionController!: GameSessionController;
    private viewEntities: GameEntity[] = [];
    private tiledReader: TiledReader = new TiledReader();
    constructor(label: string) {
        super(label)
        GuiDebugger.instance.disabled = true;

        this.addChild(this.container);

        this.loggie = new Loggie()
        this.container.addChild(this.gameplayContainer)
        this.loggie.setupRender(new RenderModule(this.gameplayContainer))
        this.loggie.addCamera(new PerspectiveCamera())


        // this.gameplayManager.onSpawnPlayer.add(this.spawnPlayer.bind(this))
        // this.gameplayManager.onAfterCollection.add(this.afterCollection.bind(this))
        // this.gameplayManager.onUpdateParenting.add(this.updateParenting.bind(this))

        const sinergyTable = PIXI.Assets.get('synergyTable.json');
        console.log(sinergyTable)


        const weapons = PIXI.Assets.get('weapons.json');
        const weaponsView = PIXI.Assets.get('weaponView.json');
        const maps = PIXI.Assets.get('graveyard1.json');
        console.log(maps)
        this.tiledReader.addMap(maps)
        WeaponLookup.instance.initialize(weapons, weaponsView)

// setTimeout(() => {
//     console.log(this.loggie)
// }, 10000);

    }
    afterCollection(collector: SessionPlayerData, collected: SessionPlayerData) {
        const entityCollected = this.viewEntities.find(entity => entity.GUID === collected.uid)
        const entityCollector = this.viewEntities.find(entity => entity.GUID === collector.uid)
        if (entityCollector) {
            entityCollector.refreshGameData();
        }
        if (entityCollected) {
            entityCollected.destroy();
        }
        this.viewEntities = this.viewEntities.filter(entity => entity.GUID !== collected.uid)
    }
    updateParenting(collector: SessionPlayerData, collected: SessionPlayerData) {
        const entityCollected = this.viewEntities.find(entity => entity.GUID === collected.uid)
        const entityCollector = this.viewEntities.find(entity => entity.GUID === collector.uid)

        console.log(collector, collected)
        console.log('SET PARENT')
        entityCollected?.setParentEntity(entityCollector)
    }
    removeEntity(collected: GameEntity) {
        this.viewEntities = this.viewEntities.filter(entity => entity.GUID !== collected.GUID)
    }
    sortCollection(collector: GameEntity, collected: GameEntity) {
        console.log(collected.sessionPlayerData)

        if (collector.sessionPlayerData) {
            this.gameplayManager.collect(collector.sessionPlayerData, collected.sessionPlayerData)
        }
        //console.log(collector, collected)
    }
    addEntity() {
        const entity = this.loggie.poolGameObject(GameEntity, true) as GameEntity
        const ang = Math.random() * 3.14 * 2
        const dist = Math.random() * 500 + 300
        entity.rigidBody.x = dist * Math.cos(ang) + 750
        entity.rigidBody.z = dist * Math.sin(ang) + 750
        entity.onRemoveEntity.add((collected: GameEntity) => { this.removeEntity(collected) })

        this.viewEntities.push(entity);

    }
    build() {

        this.loggie.start();

        this.gameWorldView = this.loggie.poolGameObject(GameWorldView, true) as GameWorldView
        this.surviveSessionController = this.loggie.poolGameObject(GameSessionController, true)
        this.surviveSessionController.startSession(this.gameWorldView);



        const mainMap = this.tiledReader.mapsLookup.get(0);
        mainMap?.placedLayers.forEach(layer => {
            layer.placedObjects.forEach(element => {
                if(element.visible){
                    const env = this.loggie.poolGameObject(TiledStaticGameEntity) as TiledStaticGameEntity                    
                    env.build(element,  this.tiledReader.objectsLookup.get(element.gid - 1), layer.layer)                
                }
            });
        });
        // const env = this.loggie.poolGameObject(StaticRigidbody) as StaticRigidbody
        // env.buildCircle(100)
        // env.rigidBody.x = 100
        // env.rigidBody.z = 100


        // const env2 = this.loggie.poolGameObject(StaticRigidbody) as StaticRigidbody
        // env2.buildCircle(100)
        // env2.rigidBody.x = 800
        // env2.rigidBody.z = 800



        // this.button = this.loggie.poolGameObject(Button, true) as Button
        // this.button.onClick.add(() => {
        //     this.addEntity();
        // })

        // this.circle1 = new PIXI.Graphics().beginFill(0xFF0000).drawCircle(0, 0, 50)
        // this.loggie.overlay.addChild(this.circle1)

        // this.circle2 = new PIXI.Graphics().beginFill(0x0Ff0ff).drawCircle(0, 0, 50)
        // this.loggie.overlay.addChild(this.circle2)

        // this.circle3 = new PIXI.Graphics().beginFill(0x00ff00).drawCircle(0, 0, 50)
        // this.loggie.overlay.addChild(this.circle3)

        // this.circle4 = new PIXI.Graphics().beginFill(0).drawCircle(0, 0, 50)
        // this.loggie.overlay.addChild(this.circle4)

    }

    update(delta: number) {
        super.update(delta);

        this.loggie.update(delta, delta);


        // //console.log(this.loggie.overlay.halfHeight)
        // this.circle1.x = this.loggie.overlay.topLeft.x
        // this.circle1.y = this.loggie.overlay.topLeft.y

        // this.circle2.x = this.loggie.overlay.topRight.x
        // this.circle2.y = this.loggie.overlay.topRight.y

        // this.circle3.x = this.loggie.overlay.bottomLeft.x
        // this.circle3.y = this.loggie.overlay.bottomLeft.y

        // this.circle4.x = this.loggie.overlay.bottomRight.x
        // this.circle4.y = this.loggie.overlay.bottomRight.y

        // this.button.x = 100
        // this.button.z = 100

    }
}