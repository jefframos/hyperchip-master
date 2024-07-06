
import * as PIXI from "pixi.js";

import AnimationSet from "loggie/core/assets/AnimationSet";
import GameObject from "loggie/core/gameObject/GameObject";
import Vector3 from "loggie/core/gameObject/Vector3";
import KinematicBody from "loggie/core/physics/KinematicBody";
import { PhysicMasks } from "loggie/core/physics/PhysicMasks";
import { PhysicsLayers } from "loggie/core/physics/PhysicsLayers";
import RigidBody from "loggie/core/physics/RigidBody";
import GameViewGraphics from "loggie/core/view/GameViewGraphics";
import GameViewSprite from "loggie/core/view/GameViewSprite";
import OneShotAnimation from "loggie/core/view/OneShotAnimation";
import Health from "loggie/utils/Health";
import { WeaponGameData } from "../weapon/WeaponGameData";
import { WeaponViewData } from "../weapon/WeaponViewData";
import ShootKickback from "./ShootKickback";

export default class BaseProjectile extends GameObject {

    private view!: GameViewSprite;
    private aliveTime: number = 5;
    private angle: number = 0;
    private weaponData!: WeaponGameData;
    private weaponView!: WeaponViewData;
    private distanceElapsed: number = 0;
    private piercingCount: number = 0;
    private distanceMultiplier: number = 0;
    private debug!: GameViewGraphics;
    private collidedList: Array<integer> = [];
    //public textField: PIXI.Text = new PIXI.Text('', Fonts.mainStyle)

    build(angle: number = 0, weaponData: WeaponGameData, weaponView: WeaponViewData, distanceMultiplier: number = 1): void {
        super.build();
        this.afterBuildFrames = 3
        this.angle = angle;
        this.weaponData = weaponData;
        this.weaponView = weaponView;
        this.distanceMultiplier = distanceMultiplier;
        this.collidedList = [];

        this.view = this.poolComponent(GameViewSprite);
        this.view.view.texture = weaponView.bulletView ? PIXI.Texture.from(weaponView.bulletView) : PIXI.Texture.EMPTY
        this.view.view.anchor.set(0.5, 1)
        this.view.view.visible = false;

        //this.view.addChild(this.textField)
        this.rigidBody = this.poolComponent(KinematicBody) as KinematicBody;
        this.rigidBody.onCollisionEnter = (go: RigidBody) => {
            this.onCollisionEnter(go)
        }
        this.rigidBody.buildCircle(this.weaponData.bulletRadius || 10)
        this.rigidBody.resetPosition();


        this.rigidBody.layerCategory = PhysicsLayers.Bullet
        this.rigidBody.layerMask = PhysicMasks.BulletCollision
        this.rigidBody.setSensor(true)


        // this.debug = this.poolComponent(GameViewGraphics);
        // this.debug.view.lineStyle({ color: 0xFFFFFF, width: 1 }).drawCircle(0, 0, this.rigidBody.body.circleRadius)

        this.transform.position.y = -50
        this.piercingCount = 0;
        this.distanceElapsed = 0;
        this.aliveTime = 5

    }
    afterBuild(): void {
        super.afterBuild()
        this.view.view.visible = true;

    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);
        this.aliveTime -= delta;
        const bulletSpeed = this.weaponData.bulletSpeed || 1;
        this.distanceElapsed += bulletSpeed * delta //* 0.1
    }
    fixedUpdate(delta: number): void {
        super.fixedUpdate(delta);



        const bulletSpeed = this.weaponData.bulletSpeed || 1;
        this.rigidBody.targetVelocity.x = (Math.cos(this.angle) * bulletSpeed * delta)
        this.rigidBody.targetVelocity.z = (Math.sin(this.angle) * bulletSpeed * delta)

        const projectileDistance = this.weaponData.shootDistance || 1000;
        this.view.view.rotation = this.angle;
        if (this.distanceElapsed > projectileDistance * this.distanceMultiplier) {
            this.destroy()
        }

    }

    onCollisionEnter(go: RigidBody) {
        if (go.body.isSleeping) {
            return;
        }
        if (this.collidedList.includes(go.GUID)) {
            return
        }
        this.collidedList.push(go.GUID)
        const health = go.gameObject.findComponent(Health) as Health
        const kickback = go.gameObject.findComponent(ShootKickback) as ShootKickback

        if (go.layerCategory == PhysicsLayers.Environment) {
            this.destroy();
            this.showImpact();
            return;
        }
        if (health) {
            health.damage(Math.round(this.weaponData.damage || 50))
            if (kickback) {
                const ang = Vector3.atan2XZ(this.transform.position, go.gameObject.transform.position) + Math.PI
                kickback.kickback(ang, this.weaponData.kickback || 0)
                this.showImpact();
            }
            this.piercingCount++
            if (this.piercingCount >= (this.weaponData.piercing || 0)) {
                this.destroy()
            }
        }

    }
    showImpact() {
        if (this.weaponView.impactVfx) {
            const oneShot = this.loggie.poolGameObject(OneShotAnimation) as OneShotAnimation;
            oneShot.build(AnimationSet.Animations.get(this.weaponView.impactVfx), this.weaponView.impactVfxFps)
            oneShot.x = this.transform.position.x
            oneShot.z = this.transform.position.z
            oneShot.y = this.y
            oneShot.gameView.view.rotation = this.angle;
        }
    }
    destroy(): void {
        super.destroy();
    }
}