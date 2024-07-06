import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import CaptureHandler from './components/CaptureHandler';
import GameViewGraphics from 'loggie/core/view/GameViewGraphics';
import SplinePoints from '../../../loggie/src/core/utils/SplinePoints';
import GameEntity from '../../shared/entity/GameEntity';
import Companion from './Companion';
import RigidBody from 'loggie/core/physics/RigidBody';
import MathUtils from 'loggie/utils/MathUtils';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import EntityDirectionIndicator from '../../shared/components/EntityDirectionIndicator';
export default class  HunterEntity extends GameEntity  {
    public captureHandler!: CaptureHandler
    private splinePointsView: GameObject[] = [];
    public waypointDistance: number = 100;
    protected debug!: GameViewGraphics;
    protected splineFollowPoints!: SplinePoints;
    protected latestWaypointGeneratedPoint: PIXI.Point = new PIXI.Point();
    constructor() {
        super()
    }
    build() {
        super.build();
        //this.poolComponent(InputControlledPhysicObject, true, 8000);
        this.captureHandler = this.poolComponent(CaptureHandler);
        this.captureHandler.build(this.entityValue)
        this.captureHandler.onEntityCaptured.removeAll();
        this.captureHandler.onEntityCaptured.add((entity:GameObject)=>{
            this.onEntityCaptured(entity)
        })

        this.splineFollowPoints = this.poolComponent(SplinePoints);
        this.splineFollowPoints.build(20, 75)
        this.setAsPlayer();
        const dir = this.poolGameObject(EntityDirectionIndicator) as EntityDirectionIndicator;
        dir.build()
        dir.autoUpdateParentPosition = true
        
        this.splinePointsView = [];

        for (let index = 0; index < 20; index++) {
            const splinePoint = this.addNewGameObject(GameObject, true) as GameObject
            splinePoint.x = 0
            splinePoint.z = 0
            // const debug = splinePoint.addNewComponent(GameViewGraphics, true) as GameViewGraphics
            // debug.view.beginFill(Math.random() * 0xFFFFFF).drawCircle(0, 0, 10)
            // debug.layer = RenderLayers.Default
            this.splinePointsView.push(splinePoint)
        }


        this.textField.text = 2;

    }
    addFollower(entity:Companion, id:integer = 0){
        entity.aiBehaviour.tofollow = this.splinePointsView[id]
    }
    afterBuild(): void {

        this.spriteView.view.visible = true;
        this.sensor.onTriggerStart.add((go: RigidBody) => {
            this.captureHandler?.checkEntity(go)
        })
    }
    onEntityCaptured(entity:GameObject){

    }
    displayWaypoints() {
        for (let index = 0; index < this.splineFollowPoints.splinePoints.length; index++) {
            this.splinePointsView[index].x = MathUtils.lerp(this.splinePointsView[index].x, this.splineFollowPoints.splinePoints[index].x, 0.1)
            this.splinePointsView[index].z = MathUtils.lerp(this.splinePointsView[index].z, this.splineFollowPoints.splinePoints[index].y, 0.1)
        }
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        this.displayWaypoints();
        this.captureHandler?.updatePoints(this.splinePointsView)
        this.textField.text = this.entityValue.value


        //this.textField.text = this.rigidBody.layerCategory

    }
}