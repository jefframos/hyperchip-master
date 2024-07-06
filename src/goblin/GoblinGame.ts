import LoggieApplication from 'loggie/LoggieApplication';
import Camera from 'loggie/core/camera/Camera';
import PerspectiveCamera from 'loggie/core/camera/PerspectiveCamera';
import GameObject from 'loggie/core/gameObject/GameObject';
import Vector3 from 'loggie/core/gameObject/Vector3';
import { MeshConfig } from 'loggie/core/mesh/MeshUtils';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import GameViewGraphics from 'loggie/core/view/GameViewGraphics';
import GameViewMesh from 'loggie/core/view/GameViewMesh';
import MathUtils from 'loggie/utils/MathUtils';
import SpringPosition from 'loggie/utils/SpringPosition';
import * as PIXI from 'pixi.js';
import BaseGame from '../../loggie/src/core/game/BaseGame';
import { Fonts } from '../Templates';
import DraggablePanel from '../goblin/grid/DraggablePanel';
import GridGenerator from '../goblin/grid/GridGenerator';
import GridRenderer from '../goblin/grid/GridRender';
import WorldPointsDebug from '../horde/view/WorldPointsDebug';
import { LootTableData } from './resource/ResourceCollectableSpawner';
import ResourceManager, { ResourceSettings } from './resource/ResourceManager';
import { TileType } from './resource/TileType';
export default class GoblinGame extends BaseGame {

    private mapCenter!: GameObject;
    private mapBounds!: GameObject;
    private pointerTracker!: GameObject;
    private pointerTracker2!: GameObject;
    private cameraOffset: PIXI.Point = new PIXI.Point();
    private sprintRotation: SpringPosition = new SpringPosition();
    private gridRender!: GridRenderer;

    private textDebug: PIXI.Text = new PIXI.Text('', Fonts.mainStyle)
    build() {

        super.build();


        this.poolGameObject(WorldPointsDebug, true, 20, 50)

        this.loggie.mainCamera.transform.rotation.x = 0;
        this.loggie.mainCamera.transform.rotation.y = 0;
        this.loggie.mainCamera.transform.rotation.z = 0;
        //this.loggie.mainCamera.transform.position.z = -200;
        //this.loggie.mainCamera.transform.position.y = -200;
        // (this.loggie.mainCamera as PerspectiveCamera).cameraAttributes.fov = 50;
        // (this.loggie.mainCamera as PerspectiveCamera).cameraAttributes.cameraViewType = CameraViewType.HorizontalDistortion;
        //this.loggie.replaceCamera(new Camera())

        const grid: GridGenerator = new GridGenerator(20, 20)

        this.gridRender = this.poolGameObject(GridRenderer, true, grid.getGridData(), 100)


        this.mapCenter = this.poolGameObject(GameObject, true);
        this.mapCenter.poolComponent(GameViewGraphics, true).view.beginFill(0xFF0000).drawCircle(0, 0, 10)

        this.pointerTracker = this.poolGameObject(GameObject, true);
        this.pointerTracker.poolComponent(GameViewMesh, true, 'marker.png', { width: 150, height: 150, segmentsX: 3, segmentsY: 3, anchor: new Vector3(0.5, 0.5, 0) } as MeshConfig) as GameViewMesh;

        const container = this.pointerTracker.poolComponent(GameViewContainer, true)
        container.view.addChild(this.textDebug)


        // InteractiveEventUtils.addPointerMove(this.gridRender.baseMesh.view, (event) => {
        //     const cc = this.gridRender.baseMesh.view.toLocal(event)
        //     this.pointerTracker2.x = cc.x
        //     this.pointerTracker2.z = cc.y
        // })

        this.pointerTracker2 = this.poolGameObject(GameObject, true);
        this.pointerTracker2.poolComponent(GameViewGraphics, true).view.beginFill(0x00FFFF).drawCircle(0, 0, 15)
        // const bounds = this.gridRender.calculateGridBounds()
        // this.mapBounds = this.poolGameObject(GameObject, true);
        // this.mapBounds.poolComponent(GameViewGraphics, true).view.lineStyle({ color: 0xFF0000, width: 5 }).drawRect(bounds.x, bounds.y, bounds.width, bounds.height)

        const corners = this.gridRender.getGridCorners()

        for (const cornerName in corners) {
            if (Object.prototype.hasOwnProperty.call(corners, cornerName)) {
                const corner = corners[cornerName as keyof GridCorners];
                const gameObject = this.poolGameObject(GameObject, true);
                gameObject.poolComponent(GameViewGraphics, true).view.beginFill(0xFFFF00).drawCircle(0, 0, 5)
                gameObject.x = corner.x
                gameObject.z = corner.y
            }
        }

        const drag = this.poolGameObject(DraggablePanel, true, this.mapCenter) as DraggablePanel

        const mapMover = new PIXI.Point();
        drag.onDragStart.add(() => {
            //const targetPoint = this.loggie.mainCamera.pointToCamera(this.mapCenter.x, 0, this.mapCenter.z)
            mapMover.x = this.cameraOffset.x
            mapMover.y = this.cameraOffset.y
        })

        drag.onDragUpdate.add((x: number, y: number) => {
            const targetX = mapMover.x - x / Camera.Zoom
            const targetY = mapMover.y - y / Camera.Zoom
            if (MathUtils.distance(targetX, targetY, this.cameraOffset.x, this.cameraOffset.y) < 100) {
                this.sprintRotation.setTarget(x * 0.005, y * 0.005)
                this.cameraOffset.x = targetX
                this.cameraOffset.y = targetY
            }
        })

        drag.onDragEnd.add(() => {
            this.sprintRotation.setTarget(0, 0)
        })

        const center = grid.getCenterTile();
        const centerPos = this.gridRender.getTilePosition(center.x, center.y)
        this.mapCenter.x = centerPos.x
        this.mapCenter.z = centerPos.y


        const resourceManager = this.poolGameObject(ResourceManager, true, grid) as ResourceManager

        const treeSettings: ResourceSettings = {
            type: 'tree',
            allowedTiles: [TileType.Grass],
            densityPerTileArea: 5,
            batchSpawnTime: 500,
            maxOnScreen: 50,
            batchSize: 5,
            generationTime: 10000
        };


        const lootTableData: LootTableData = {
            forceToSpawn: true,
            maxItems: 1,
            entries: [
                { type: "log", chance: 1, minAmount: 1, maxAmount: 3 },
                { type: "berry", chance: 0.3, minAmount: 1, maxAmount: 5 },
                { type: "leaf", chance: 0.2, minAmount: 1, maxAmount: 3 }
            ]
        };

        resourceManager.addGenerator(treeSettings);
        resourceManager.setLootTable('tree', lootTableData);
        // for (let index = 0; index < 8; index++) {
        //     const interactable = this.poolGameObject(WorldInteractable, true) as WorldInteractable
        //     const rnd = RandomUtils.randomPointInCircle()
        //     interactable.x = Math.floor((centerPos.x + rnd.x * 500) / 100) * 100
        //     interactable.z = Math.floor((centerPos.y + rnd.y * 500) / 100) * 100
        //     interactable.setUpView()
        //     //interactable.z = 10
        // }
    }

    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);


        this.sprintRotation.update(delta)
        if (this.loggie.mainCamera instanceof PerspectiveCamera) {

            // this.loggie.mainCamera.transform.rotation.x = 50 + this.sprintRotation.getPosition().y;
            // this.loggie.mainCamera.transform.rotation.y = 20 + this.sprintRotation.getPosition().y;
            // this.loggie.mainCamera.transform.rotation.z = 20 + this.sprintRotation.getPosition().x;
        }

        //this.loggie.mainCamera.setFollowPoint(this.mapCenter.transform.position, true)
        this.loggie.mainCamera.setCameraOffset(this.cameraOffset.x, this.cameraOffset.y)
        this.loggie.mainCamera.setZoom(0.5)
        //console.log(this.loggie.mainCamera)
        if (this.pointerTracker) {

            const worldPoint = this.loggie.mainCamera.screenToWorld(LoggieApplication.globalPointer.x, LoggieApplication.globalPointer.y)
            this.pointerTracker.x = worldPoint.x
            this.pointerTracker.z = worldPoint.y
            //console.log(this.pointerTracker.z)

            this.pointerTracker2.x = this.loggie.mainCamera.cameraCenter.x
            this.pointerTracker2.z = this.loggie.mainCamera.cameraCenter.y

            this.textDebug.text = `${Math.round(this.pointerTracker.x)},${Math.round(this.pointerTracker.z)}`
        }


    }
}