import gsap from 'gsap';
import Follow from 'loggie/ai/Follow';
import Wander from 'loggie/ai/Wander';
import BaseComponent from 'loggie/core/gameObject/BaseComponent';
import GameObject from 'loggie/core/gameObject/GameObject';
import MathUtils from 'loggie/utils/MathUtils';
import CaptureHandler from './CaptureHandler';
export default class AiBehaviour extends BaseComponent {
    private wander!: Wander;
    public follow!: Follow;
    public value: number = 2;
    private merging: boolean = false;
    private snappingNormal: number = 0;
    public tofollow!: GameObject | undefined;
    private snappingTarget!: GameObject | undefined;
    public captureHandler!: CaptureHandler | undefined;
    public captureTimer: number = 0
    public get canCapture() {
        return !this.merging && !this.snappingTarget && this.captureTimer <= 0
    }

    public get canCollide() {
        return this.follow.canCollide;
    }
    constructor() {
        super()
    }
    build() {
        super.build();

        this.value = 2;
        this.merging = false;
        this.snappingTarget = undefined;
        this.captureHandler = undefined;

        this.wander = this.gameObject.poolComponent(Wander)
        this.wander.maxSpeed = 1
        this.wander.setOriginPoint(this.gameObject.transform.position)
        this.wander.reset()

        this.follow = this.gameObject.poolComponent(Follow)
        this.follow.targetSpeed = 0//1
        this.follow.reset()
    }
    captured(captureHandler: CaptureHandler) {
        if (this.captureHandler) {
            this.captureHandler.removeEntity(this);
        }
        this.captureHandler = captureHandler;
        this.captureTimer = 2;
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        if (this.captureTimer > 0) {
            this.captureTimer -= delta;
        }
        if (this.merging && this.snappingTarget) {
            this.gameObject.x = MathUtils.lerp(this.gameObject.x, this.snappingTarget.x, this.snappingNormal)
            this.gameObject.z = MathUtils.lerp(this.gameObject.z, this.snappingTarget.z, this.snappingNormal)
            return;
        }

        if (this.tofollow) {
            this.follow.follow(this.tofollow)
        } else {
            this.gameObject.rigidBody.targetVelocity.z = this.follow.targetSpeed * this.loggie.mainCamera.getPositionScale(this.gameObject.transform.position)
            //this.wander.updateBehaviour(delta, unscaledTime)
        }

    }
    mergeTo(target: GameObject) {
        this.merging = true;
        this.snappingNormal = 0;
        this.snappingTarget = target;
        gsap.to(this, {
            snappingNormal: 1,
            duration: 0.2,
            onComplete: () => {
                this.gameObject.destroy();
            }
        })
    }
    destroy(): void {
        super.destroy();
        this.captureHandler = undefined;
        this.tofollow = undefined;
        this.merging = false;
    }
    setToIgnore() {
        this.gameObject.setAsPlayer()
    }
}