import * as PIXI from "pixi.js";

import AnimationSet from "loggie/core/assets/AnimationSet";
import Animator, { CommonAnimationStates } from "loggie/core/assets/Animator";
import GameObject from "loggie/core/gameObject/GameObject";
import InputControlledPhysicObject from "loggie/core/input/InputControlledPhysicObject";
import KinematicBody from "loggie/core/physics/KinematicBody";
import { PhysicMasks } from "loggie/core/physics/PhysicMasks";
import { PhysicsLayers } from "loggie/core/physics/PhysicsLayers";
import RigidBody from "loggie/core/physics/RigidBody";
import { RenderLayers } from "loggie/core/render/RenderLayers";
import { CardinalDirection } from "loggie/core/utils/Cardinals";
import Sensor from "loggie/core/utils/Sensor";
import GameViewContainer from "loggie/core/view/GameViewContainer";
import GameViewGraphics from "loggie/core/view/GameViewGraphics";
import GameViewSprite from "loggie/core/view/GameViewSprite";
import FloatInterpolator from "loggie/utils/FloatInterpolator";
import Health from "loggie/utils/Health";
import ViewUtils from "loggie/utils/ViewUtils";
import { Signal } from "signals";
import CardinalAnimator from "../../../loggie/src/utils/components/CardinalAnimator";
import { Fonts } from "../../Templates";
import { AnimationsStruct } from "../../assets/AnimationsStruct";
import EntityValue from "../../collectaton/entity/components/EntityValue";
import SessionPlayerData from "../../collectaton/game/data/SessionPlayerData";
import ParticleEmitter from "../../horde/view/ParticleEmitter";
import { EntityAnimationStruct } from "../EntityViewLookup";
import EntityShadow from "../components/EntityShadow";
import ShootKickback from "../components/ShootKickback";
import { EntityViewAnimationType, EntityViewData } from "./EntityViewData";

export default class GameEntity extends GameObject {
    protected debug!: GameViewGraphics;
    public spriteView!: GameViewSprite;
    protected textContainer!: GameViewContainer;
    protected animator!: Animator;
    protected cardinalAnimator?: CardinalAnimator;
    public speed: number = 5000;
    public textField: PIXI.Text = new PIXI.Text('', Fonts.mainStyle)
    private acceleration!: FloatInterpolator;
    public value: integer = 2
    public sessionPlayerData!: SessionPlayerData;
    public animationState: CommonAnimationStates = CommonAnimationStates.Idle;
    protected health!: Health;
    protected sensor!: Sensor;
    protected entityValue!: EntityValue;
    public baseWidth: number = -1;
    protected viewData!: EntityViewData
    protected dyingState: boolean = false;
    protected shadow!: EntityShadow;
    public onRemoveEntity: Signal = new Signal();
    public onWipe: Signal = new Signal();
    public onRespawn: Signal = new Signal();
    private waitingDestroy: boolean = false;
    constructor() {
        super();


    }
    afterBuild(): void {

        this.spriteView.view.visible = true;
    }
    build(...data: any) {
        super.build();

        this.setUpComponents();

    }
    setUpComponents() {
        this.waitingDestroy = false;
        this.rigidBody = this.poolComponent(KinematicBody) as KinematicBody;
        this.rigidBody.buildCircle(25)

        this.health = this.poolComponent(Health) as Health;
        this.health.removeAllSignals();
        this.health.reset();
        this.health.onKill.add(() => {
            this.startDie()
        })

        // this.debug = this.poolComponent(GameViewGraphics);
        // this.debug.view.lineStyle({ color: 0xFFFFFF, width: 5 }).drawCircle(0, 0, this.rigidBody.body.circleRadius)
        //this.shadow = this.poolComponent(EntityShadow, true);
        this.poolComponent(ShootKickback, true)
        this.entityValue = this.poolComponent(EntityValue, true)

        this.spriteView = this.poolComponent(GameViewSprite);
        this.spriteView.layer = RenderLayers.Gameplay;
        this.textContainer = this.poolComponent(GameViewContainer);
        //this.textContainer.addChild(this.textField)
        this.textContainer.layer = RenderLayers.FrontLayer
        this.textField.text = 2
        this.textField.anchor.set(0.5)

        this.acceleration = this.poolComponent(FloatInterpolator)
        this.acceleration.lerp = 0.04

        // const debugRb = this.poolComponent(GameViewColliderDebug);
        // debugRb.showCollider(this.rigidBody)

        this.animator = this.poolComponent(Animator)
        this.animator.setSprite(this.spriteView.view, 0.5, 0.5);
        this.spriteView.view.visible = false;


        // this.sensor = this.poolGameObject(Sensor);
        // this.sensor.build(35)
        // this.sensor.rigidBody.layerCategory = PhysicsLayers.Sensor
        // this.sensor.rigidBody.layerMask = PhysicMasks.SensorOnly
        // this.sensor.rigidBody.x = -9000000 + Math.random() * 100000
        // this.sensor.rigidBody.z = -9000000 + Math.random() * 100000
        //this.sensor.addDebug()

        this.setAsEnemy();

        this.dyingState = false;
    }
    setupView(viewData: EntityViewData) {
        this.viewData = viewData;

        this.animator.setSprite(this.spriteView.view, this.viewData.anchor?.x || 0.5, this.viewData.anchor?.y || 0.5);

        if (this.viewData.animationType == EntityViewAnimationType.AllCardinal) {
            this.cardinalAnimator = this.poolComponent(CardinalAnimator) as CardinalAnimator
            for (const key in this.viewData.animationSet) {
                if (Object.prototype.hasOwnProperty.call(this.viewData.animationSet, key)) {
                    const element = this.viewData.animationSet[key];


                    const splithPath = element.animationPath.split('.')
                    var pathData = AnimationsStruct[splithPath[0]];
                    for (let index = 1; index < splithPath.length - 1; index++) {
                        pathData = pathData[splithPath[index]];

                    }
                    const animation = CardinalAnimator.animationSetHelper(pathData, splithPath[splithPath.length - 1], element.extras?.flippedDirections || [], element.fps)
                    this.cardinalAnimator.build(key, this.animator, animation)
                }
            }

        } else if (this.viewData.animationType == EntityViewAnimationType.Direction2) {
            for (const key in this.viewData.animationSet) {
                if (Object.prototype.hasOwnProperty.call(this.viewData.animationSet, key)) {
                    const element = this.viewData.animationSet[key];
                    const splithPath = element.animationPath.split('.')
                    var pathData = AnimationsStruct[splithPath[0]];
                    for (let index = 1; index < splithPath.length; index++) {
                        pathData = pathData[splithPath[index]];

                    }
                    this.animator.registerAnimation(key, {
                        frames: AnimationSet.Animations.get(pathData),
                        fps: element.fps,
                        loop: 'loop' in element ? element.loop : true,
                    })
                    this.animator.play(key)
                }
            }
        }
        else if (this.viewData.animationType == EntityViewAnimationType.SingleAnimation) {
            for (const key in this.viewData.animationSet) {
                if (Object.prototype.hasOwnProperty.call(this.viewData.animationSet, key)) {
                    const element = this.viewData.animationSet[key];
                    const splithPath = element.animationPath.split('.')
                    var pathData = AnimationsStruct[splithPath[0]];
                    for (let index = 1; index < splithPath.length; index++) {
                        pathData = pathData[splithPath[index]];

                    }
                    this.animator.registerAnimation(key, {
                        frames: AnimationSet.Animations.get(pathData),
                        fps: element.fps,
                        loop: 'loop' in element ? element.loop : true,
                    })
                    this.animator.play(key)
                }
            }
        }

    }
    setupAnimator(animationStruct: EntityAnimationStruct) {
        this.cardinalAnimator = this.poolComponent(CardinalAnimator) as CardinalAnimator

        if (animationStruct.Idle) {
            this.cardinalAnimator.build(CommonAnimationStates.Idle, this.animator, animationStruct.Idle)
        }
        if (animationStruct.Run) {
            this.cardinalAnimator.build(CommonAnimationStates.Run, this.animator, animationStruct.Run)
        }
        if (animationStruct.Death) {
            this.cardinalAnimator.build(CommonAnimationStates.Die, this.animator, animationStruct.Death)
        }
        this.spriteView.viewScale.set(ViewUtils.elementScaler(this.spriteView.view, this.baseWidth, this.baseWidth))

    }
    setAsPlayer() {
        this.rigidBody.layerCategory = PhysicsLayers.Player
        this.rigidBody.layerMask = PhysicMasks.PlayerCollision
        this.refreshDebug();
    }
    setAsEnemy() {
        this.rigidBody.layerCategory = PhysicsLayers.Enemy
        this.rigidBody.layerMask = PhysicMasks.EnemyCollision

        this.refreshDebug();
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        if (this.dyingState || this.waitingDestroy) {
            return;
        }
        // this.textField.scale.x = this.spriteView.viewScale.x
        if (this.rigidBody.targetVelocity.length() > 1) {
            this.animationState = CommonAnimationStates.Run
        } else {
            this.animationState = CommonAnimationStates.Idle
        }

        if (this.baseWidth > 0) {
            this.spriteView.viewScale.set(ViewUtils.elementScaler(this.spriteView.view, this.baseWidth, this.baseWidth))
        }


        if (this.z > 500) {
            this.destroy()
        }
    }
    protected updateAnimation() {

        if (this.cardinalAnimator) {
            const animationData = this.cardinalAnimator.play(this.animationState, this.transform.lookAtdirection8)
            if (animationData?.flipped) {
                this.spriteView.viewScale.x *= -1
            }
        } else if (this.animator) {
            if (this.transform.direction2 == CardinalDirection.East) {
                this.spriteView.viewScale.x = -Math.abs(this.spriteView.viewScale.x)
            } else {
                this.spriteView.viewScale.x = Math.abs(this.spriteView.viewScale.x)
            }
            this.animator.play(this.animationState);
        }
    }
    public lateUpdate(delta: number, unscaledDelta: number): void {
        super.lateUpdate(delta, unscaledDelta)

        if (this.dyingState) {
            return;
        }
        this.updateAnimation();


        //this.textField.text = this.spriteView.view.zIndex

    }

    setParentEntity(entity: GameEntity) {
        this.parent = entity;
        this.setAsPlayer()
    }

    refreshDebug() {
        // this.debug.view.clear();
        // this.debug.view.lineStyle({ color: this.rigidBody.layerCategory == PhysicsLayers.Player ? 0xFF0000 : 0xFFFFFF, width: 5 }).drawCircle(0, 0, this.rigidBody.body.circleRadius)
    }
    mergeUp() {
        this.refreshDebug();
    }
    refreshGameData() {
        // this.textField.text = this.sessionPlayerData?.value + ' - ' + this.GUID;
        this.refreshDebug();
    }

    onCollisionEnter(target: RigidBody) {

        if (!this.findComponent(InputControlledPhysicObject)) {
            return;
        }

        if (target.gameObject instanceof GameEntity) {
            const movable: GameEntity = target.gameObject;
            if (target.layerCategory == PhysicsLayers.Player) {
                return;
            }
            //console.log('collect')
            //this.onCollectEntity.dispatch(this, target.gameObject);
            // if (this.rigidBody.layerCategory == PhysicsLayers.Player) {
            //     movable.setAsPlayer();
            //     this.setAsChild(movable);
            // }
        }
    }
    startDie() {
        if (this.dyingState) {
            return;
        }
        this.onRemoveEntity.dispatch(this);
        //this.destroy();
        this.waitingDestroy = true;

        this.animationState = CommonAnimationStates.Death
        this.animator.play(CommonAnimationStates.Death, true, () => {
            this.wipe();
        })


        this.dyingState = true;
        //this.sensor.rigidBody.body.isSleeping = true
        this.shadow?.destroy();
        // gsap.to(this.spriteView.view, {
        //     // alpha: 0,
        //     duration: 0.5,
        //     delay: 1,
        //     onComplete: () => {

        //     }
        // })

        const testEmitter = this.poolComponent(ParticleEmitter, true, {
            lifetime: {
                min: 0.1,
                max: 0.1
            },
            frequency: 0.008,
            spawnChance: 1,
            particlesPerWave: 1,
            emitterLifetime: 0.1,
            maxParticles: 30,
            pos: {
                x: 0,
                y: 0
            },
            addAtBack: false,
            behaviors: [
                {
                    type: 'alpha',
                    config: {
                        alpha: {
                            list: [
                                {
                                    value: 0.8,
                                    time: 0
                                },
                                {
                                    value: 0.1,
                                    time: 1
                                }
                            ],
                        },
                    }
                },
                {
                    type: 'scale',
                    config: {
                        scale: {
                            list: [
                                {
                                    value: 0.03,
                                    time: 0
                                },
                                {
                                    value: 0.01,
                                    time: 1
                                }
                            ],
                        },
                    }
                },
                {
                    type: 'color',
                    config: {
                        color: {
                            list: [
                                {
                                    value: "ff0033",
                                    time: 0
                                },
                                {
                                    value: "a31a1a",
                                    time: 1
                                }
                            ],
                        },
                    }
                },
                {
                    type: 'moveSpeed',
                    config: {
                        speed: {
                            list: [
                                {
                                    value: 200,
                                    time: 0
                                },
                                {
                                    value: 80,
                                    time: 1
                                }
                            ],
                            isStepped: false
                        },
                    }
                },
                {
                    type: 'rotationStatic',
                    config: {
                        min: 0,
                        max: 360
                    }
                },
                {
                    type: 'spawnShape',
                    config: {
                        type: 'torus',
                        data: {
                            x: 0,
                            y: 0,
                            radius: 10
                        }
                    }
                },
                {
                    type: 'textureSingle',
                    config: {
                        texture: PIXI.Texture.from('shadow.png')
                    }
                }
            ],
        }) as ParticleEmitter

        //this.spriteView.view.tint = 0xFFaaaa
        setTimeout(() => {

            this.spriteView.customZIndex = -2524
            this.y = 80
            this.rigidBody.body.isSleeping = true

        }, 100);
        testEmitter.emitter.updateSpawnPos(this.spriteView.x, this.spriteView.y - 50)
        // if(!this.sensor.destroyed){
        //     this.sensor.destroy()
        // }
    }
    async wipe() {

        this.onWipe.dispatch(this)
        this.destroy();
    }
    destroy(): void {
        this.cardinalAnimator = undefined;
        super.destroy();
    }
}