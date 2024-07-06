import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import GameEntity from '../../shared/entity/GameEntity';
import CaptureHandler from './components/CaptureHandler';
import SplinePoints from '../../../loggie/src/core/utils/SplinePoints';
import GameViewGraphics from 'loggie/core/view/GameViewGraphics';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import MathUtils from 'loggie/utils/MathUtils';
import BehaviourTree from 'loggie/ai/BehaviourTree';
import ActionNode from 'loggie/ai/ActionNode';
import SelectorNode from 'loggie/ai/SelectorNode';
import Wander from 'loggie/ai/Wander';
import DataUtils from 'loggie/utils/DataUtils';
import Matter from 'matter-js';
import { PhysicsLayers } from 'loggie/core/physics/PhysicsLayers';
import Follow from 'loggie/ai/Follow';
import OvertimeCallback from 'loggie/core/utils/OvertimeCallback';
import AiBehaviour from './components/AiBehaviour';
import HunterEntity from './HunterEntity';
import EntityValue from './components/EntityValue';
enum BehaviourType {
    Seek,
    Wander
}
export default class MockPlayer extends HunterEntity {
    protected actionTime: number = 3;
    private behaviourType: BehaviourType = BehaviourType.Wander;
    private wander!: Wander;
    private follow!: Follow;
    public tofollow!: GameObject | undefined;
    private overtimeRaycast!: OvertimeCallback;

    constructor() {
        super()
    }
    build() {
        super.build();


        this.wander = this.gameObject.poolComponent(Wander)
        this.wander.maxSpeed = 8
        this.wander.setOriginPoint(this.gameObject.transform.position)
        this.wander.reset()

        this.follow = this.gameObject.poolComponent(Follow)
        this.follow.targetSpeed = 8
        this.follow.reset()

        this.overtimeRaycast = new OvertimeCallback(1, () => {
            this.rayCast();
        })
    }
    afterBuild(): void {
        super.afterBuild()
        this.setAsPlayer();
        setTimeout(() => {
            this.rayCast()
        }, 100);
    }
  
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);
        this.overtimeRaycast.update(delta);
        if (this.tofollow) {
            this.follow.follow(this.tofollow)
            //console.log(this.tofollow)
        } else {
            //this.wander.updateBehaviour(delta, unscaledTime)
        }

    }
    onEntityCaptured(entity:GameObject){
        if(entity.GUID == this.tofollow?.GUID){
            this.tofollow= undefined;
            this.rayCast()
        }
    }
    rayCast() {
        //////////RAY CASTS
        const casts = DataUtils.shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8])

        const bodies = this.loggie.physics.allBodies.filter(item => item.id !== this.rigidBody.body.id);
        for (let index = 0; index < casts.length; index++) {
            const targetAngle = casts[index] / casts.length * Math.PI * 2;

            const collisions = Matter.Query.ray(
                bodies, // Bodies to check for collision
                { x: this.x, y: this.z },           // Start point of the ray
                { x: this.x + Math.cos(targetAngle) * 800, y: this.z + Math.sin(targetAngle) * 800 },             // End point of the ray
            );



            if (collisions.length) {

                for (let index = 0; index < Math.min(5, collisions.length); index++) {
                    const collision = collisions[index];
                    if (collision.bodyA.rigidbody.layerCategory == PhysicsLayers.Enemy) {

                        const toFollow = collision.bodyA.rigidbody.gameObject;

                        const behaviour = toFollow.findComponent(AiBehaviour) as AiBehaviour
                        if (behaviour && behaviour.canCapture) {

                            const entityValue = toFollow.findComponent(EntityValue) as EntityValue
                            if (entityValue && entityValue.value <= this.entityValue.value) {

                                this.tofollow = collision.bodyA.rigidbody.gameObject;

                                return
                            }
                        }
                    }

                }

            }
        }
    }
}