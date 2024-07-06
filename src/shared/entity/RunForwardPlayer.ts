import LoggieApplication from 'loggie/LoggieApplication';
import AnimationSet from 'loggie/core/assets/AnimationSet';
import Vector3 from 'loggie/core/gameObject/Vector3';
import { AnimationsStruct } from '../../assets/AnimationsStruct';
import BaseWeapon from '../components/BaseWeapon';
import GameEntity from './GameEntity';
export default class RunForwardPlayer extends GameEntity {
    public holdingWeapon!: BaseWeapon;
    private latestPosition: Vector3 = new Vector3();
    private latestMovementType: string = 'idle';
    private isIdleStanding: boolean = false;
    constructor() {
        super()
    }

    build() {
        super.build();
        //this.rigidBody.setSensor(true)

        //this.poolComponent(EntityShadow, true);
        // const marker = (this.poolComponent(GameViewGraphics, true) as GameViewGraphics)
        // marker.view.lineStyle({ color: 0x00FF00, width: 2 }).drawCircle(0, 0, 30);
        // marker.customZIndex = 10

        this.latestMovementType = 'idle'
        this.isIdleStanding = false;

        this.animator.registerAnimation('idle', {
            frames: AnimationSet.Animations.get(AnimationsStruct.Survival.Characters.Swat.Swat_idle_north),
            fps: 32,
            loop: true
        })

        this.animator.registerAnimation('left', {
            frames: AnimationSet.Animations.get(AnimationsStruct.Survival.Characters.Swat.Swat_left_north),
            fps: 24,
            loop: true
        })

        this.animator.registerAnimation('right', {
            frames: AnimationSet.Animations.get(AnimationsStruct.Survival.Characters.Swat.Swat_right_north),
            fps: 24,
            loop: true
        })

        this.animator.registerAnimation('left-idle', {
            frames: AnimationSet.Animations.get(AnimationsStruct.Survival.Characters.Swat.Swat_left_idle_north),
            fps: 24,
            loop: true
        })

        this.animator.registerAnimation('right-idle', {
            frames: AnimationSet.Animations.get(AnimationsStruct.Survival.Characters.Swat.Swat_right_idle_north),
            fps: 24,
            loop: true
        })

        this.animator.play('idle')
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        this.isIdleStanding = false;
        this.latestMovementType = 'idle'
        if (Math.abs(this.transform.position.x - this.latestPosition.x) > 0.1 || LoggieApplication.isPointerDown) {
            if (this.transform.position.x - this.latestPosition.x < 0) {
                this.latestMovementType = 'left'
            } else if (this.transform.position.x - this.latestPosition.x > 0) {
                this.latestMovementType = 'right'
            } else {
                this.isIdleStanding = true;
            }
        }
        if (!this.holdingWeapon) {
            return
        }
        switch (this.latestMovementType) {
            case 'idle':
                this.holdingWeapon.masterOffset.x = 20
                this.holdingWeapon.masterOffset.y = 0
                break;

            case 'left':
                this.holdingWeapon.masterOffset.x = 20
                this.holdingWeapon.masterOffset.y = -20
                if (this.isIdleStanding) {
                    this.latestMovementType = 'left-idle'
                }
                break;
            case 'right':
                this.holdingWeapon.masterOffset.x = 30
                this.holdingWeapon.masterOffset.y = -20
                if (this.isIdleStanding) {
                    this.latestMovementType = 'right-idle'
                }
                break;
        }
        if (this.isIdleStanding) {
            //this.animator.pause()
        } else {
            this.animator.playAt(this.latestMovementType, false, this.animator.currentAnimationFrame)
        }
    }
    setWeapon(baseWeapon: BaseWeapon) {
        this.holdingWeapon = baseWeapon;
    }
    public lateUpdate(delta: number, unscaledDelta: number): void {
        this.transform.lookAtAngle = -3.14 / 2

        this.latestPosition.x = this.transform.position.x

    }
}