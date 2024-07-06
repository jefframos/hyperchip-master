import CameraSimplifiedPerspective from 'loggie/core/camera/CameraSimplifiedPerspective';
import GameObject from 'loggie/core/gameObject/GameObject';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import TiledBaseWorld from 'loggie/core/tiled/TiledBaseWorld';
import TiledReader from 'loggie/core/tiled/TiledReader';
import GameViewGraphics from 'loggie/core/view/GameViewGraphics';
import * as PIXI from 'pixi.js';
import { Signal } from 'signals';
import AiGameEntity from '../../collectaton/entity/AiGameEntity';
import EntityLookup from '../../shared/entity/EntityLookup';
import GameEntity from '../../shared/entity/GameEntity';
import CollectableByDestroying from '../entity/CollectableByDestroying';
import EntityGroup from '../entity/EntityGroup';
import PlayerSlot from '../entity/PlayerSlot';
import UpgradePickup from '../entity/UpgradePickup';
import SpawnerRegion from '../game/SpawnerRegion';
import { Wave, WaveType } from '../level/Wave';
import CityView from './CityView';
import FloorTexture from './FloorTexture';
import Hud from './Hud';


export default class HordeSessionView extends GameObject {

    private cityView!: CityView;
    private map!: TiledBaseWorld;
    public groupMatrix!: EntityGroup<GameObject>;
    private pointerTracker2!: GameObject;

    private spawners: SpawnerRegion[] = [];
    private spawnersBodies: Matter.Body[] = [];
    private activePlayerMap: Map<GameEntity, PIXI.Point> = new Map();

    public onCollectCollectable: Signal = new Signal();
    public onUpgradeWeapon: Signal = new Signal();
    public onAddPlayer: Signal = new Signal();
    public streetWidth: number = 600;
    public dropPanel!: GameObject;
    public mouseTracker!: GameObject;
    public floorTexture!: FloorTexture;


    constructor() {
        super()
    }
    build() {
        super.build();
        this.loggie.mainCamera.forceZoom(0.75)

        //this.ground = this.loggie.poolGameObject(Ground, true)

        this.map = this.loggie.poolGameObject(TiledBaseWorld, true)
        const tilemap = PIXI.Assets.get('simpleBounds.json')
        //TiledMapData.
        this.map = this.poolGameObject(TiledBaseWorld)
        this.map.buildWorld(TiledReader.instance.addMap(tilemap), false)

        const deadZone = this.map.findObjectsByType("DeadZone")
        deadZone.forEach(element => {
            const deadZone = this.map.findGameObjectById(element.id)
            deadZone?.setSensor(true)
        });

        //console.log(this.map)
        // this.pointerTracker2 = this.poolGameObject(GameObject, true);
        // this.pointerTracker2.poolComponent(GameViewGraphics, true).view.beginFill(0x00FFFF).drawCircle(0, 0, 15)
        //this.poolGameObject(WorldPointsDebug, true, 20, 50)

        const hud = this.poolGameObject(Hud, true) as Hud
        hud.onAddPlayer.add(() => {
            this.onAddPlayer.dispatch()
        })

        hud.onUpgradeWeapon.add(() => {
            this.onUpgradeWeapon.dispatch()
        })

        this.cityView = this.poolGameObject(CityView, true)
        this.loggie.mainCamera.z = -450
        if (this.loggie.mainCamera instanceof CameraSimplifiedPerspective) {

            const perspCam = this.loggie.mainCamera as CameraSimplifiedPerspective
            perspCam.cameraAttributes.horizonY = 80
            perspCam.cameraAttributes.applyScaleY = true
        }
        this.cityView.z = 650

        this.groupMatrix = new EntityGroup<GameObject>([
            [21, 7, 1, 0, 2, 6, 20],
            [23, 9, 4, 3, 5, 8, 22],
            [25, 14, 12, 10, 11, 13, 24],
            [27, 19, 17, 15, 16, 18, 26]
        ], null)

        this.dropPanel = this.poolGameObject(GameObject, true)
        const panel = this.dropPanel.poolComponent(GameViewGraphics, true, RenderLayers.FrontLayer) as GameViewGraphics
        panel.layer = RenderLayers.FrontLayer
        panel.customZIndex = -50000
        panel.view.beginFill(0xFF0000).drawRect(-350, -2000, 700, 3000).alpha = 0
        this.dropPanel.z = 0
        this.dropPanel.y = 20
        let down = false
        let latestX = 0
        let direction = 0
        panel.view.eventMode = 'static'
        panel.view.onpointerdown = (e) => {
            down = true;
        }
        panel.view.onpointerupoutside = (e) => {
            down = false;
        }
        panel.view.onpointerup = (e) => {
            down = false;
        }
        panel.view.onpointermove = (e) => {
            if (!down) return
            const p = panel.view.toLocal(e)
            //const c = this.loggie.mainCamera.screenToWorld(p.x, p.y)
            direction = p.x - latestX
            latestX = p.x
            this.groupMatrix.move(direction)
        }
        this.floorTexture = this.poolGameObject(FloorTexture, true);
    }

    addNewPlayer(playerType: any) {
        const targetPoint = this.groupMatrix.addEntity(this.addNewGameObject(PlayerSlot, true))

        const player = this.loggie.poolGameObject(playerType, true) as GameEntity
        player.rigidBody.x = 0
        player.rigidBody.z = 0

        this.activePlayerMap.set(player, targetPoint);
        return player;

    }

    setSpawnerRegions(spawners: SpawnerRegion[]) {
        this.spawners = spawners;

        this.spawners.forEach(element => {
            this.spawnersBodies.push(element.body)
        });

    }

    spawnGameEntity(custonmConstructor: any): GameEntity {
        const gameEntity = this.loggie.poolGameObject(custonmConstructor ? custonmConstructor : GameEntity, true) as GameEntity
        gameEntity.rigidBody.x = 0
        gameEntity.rigidBody.z = 0


        return gameEntity;
    }

    spawnEntity(wave: Wave): GameEntity[] {

        const entities: GameEntity[] = [];

        const lanes = wave.customTotalLanes || 3
        const lanePosition = (this.streetWidth / lanes) * (wave.lane - 1)
        const laneWidth = (this.streetWidth / lanes)

        let extraX = laneWidth / 2
        let extraY = 0
        if (!wave.avoidRandom) {
            extraX = laneWidth * Math.random()
            extraY = laneWidth * Math.random()
        }
        const targetPositionX = lanePosition + extraX - this.streetWidth / 2
        const targetPositionY = -1500 + extraY
        if (wave.type == WaveType.Destroyable) {

            const entity = this.loggie.poolGameObject(CollectableByDestroying, true, laneWidth) as CollectableByDestroying
            entity.rigidBody.x = targetPositionX
            entity.rigidBody.z = targetPositionY //+ 1500
            entities.push(entity)

            entity.onCollectEntity.add((guid: integer) => {
                this.onCollectCollectable.dispatch(guid)
            })

        } else if (wave.type == WaveType.Upgrade) {

            const entity = this.loggie.poolGameObject(UpgradePickup, true, laneWidth) as UpgradePickup
            entity.rigidBody.x = targetPositionX
            entity.rigidBody.z = targetPositionY //+ 3000
            entities.push(entity)

            entity.onCollectEntity.add((guid: integer, collector: integer) => {
                this.onCollectCollectable.dispatch(guid, collector)
            })

        } else {
            const entity = this.loggie.poolGameObject(AiGameEntity, true) as AiGameEntity
            entity.rigidBody.x = targetPositionX
            entity.rigidBody.z = targetPositionY
            const enemiesId = ['hzonmbie', 'witch', 'skeleton']

            const viewData = EntityLookup.instance.getEntityView(enemiesId[Math.floor(Math.random() * enemiesId.length)])
            entity.setupView(viewData)
            entity.baseWidth = 300

            entities.push(entity)
            entity.aiBehaviour.follow.targetSpeed = 2 + Math.random() * 1
        }


        return entities

    }

    enemyDead(enemy: GameEntity) {
        this.floorTexture.stampBlood(enemy.spriteView.view);
    }
    enemyWipe(enemy: GameEntity) {
        this.floorTexture.stamp(enemy.spriteView.view);
    }

    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        // if (this.player) {
        //     //this.loggie.mainCamera.setFollowPoint(this.player.transform.position)
        //     this.player.rigidBody.z = 250

        // } else {
        // }
        //this.loggie.mainCamera.setFollowPoint(this.fo)
        this.loggie.mainCamera.setZoom(1)


        this.groupMatrix.update(delta, unscaledTime)

        this.activePlayerMap.forEach((value, key) => {
            if (value) {
                const matrix = this.groupMatrix.getMatrix();
                if (matrix[value.x][value.y]) {
                    key.rigidBody.x = matrix[value.x][value.y].x
                    key.rigidBody.z = matrix[value.x][value.y].z
                }
            }

        });
        // this.pointerTracker2.x = this.loggie.mainCamera.cameraCenter.x
        // this.pointerTracker2.z = this.loggie.mainCamera.cameraCenter.y

        // const pointer = this.loggie.mainCamera.screenToWorld(LoggieApplication.globalPointer.x, LoggieApplication.globalPointer.y)
        // this.mouseTracker.x = pointer.x
        // this.mouseTracker.z = pointer.y

    }
}