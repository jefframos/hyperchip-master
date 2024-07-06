
import GameObject from "loggie/core/gameObject/GameObject";
import BaseProjectile from "./BaseProjectile";
import Vector3 from "loggie/core/gameObject/Vector3";
import GameViewGraphics from "loggie/core/view/GameViewGraphics";
import Sensor from "loggie/core/utils/Sensor";
import { PhysicsLayers } from "loggie/core/physics/PhysicsLayers";
import { PhysicMasks } from "loggie/core/physics/PhysicMasks";
import GameViewSprite from "loggie/core/view/GameViewSprite";
import { CardinalDirection } from "loggie/core/utils/Cardinals";
import MathUtils from "loggie/utils/MathUtils";
import Matter from "matter-js";
import OneShotAnimation from "loggie/core/view/OneShotAnimation";
import AnimationSet from "loggie/core/assets/AnimationSet";
import CardinalView from "loggie/utils/components/CardinalView";
import { WeaponGameData } from "../weapon/WeaponGameData";
import { WeaponViewData } from "../weapon/WeaponViewData";
import { WeaponShootType } from "../weapon/WeaponShotType";
import { WeaponGameDataMultiplier } from "../weapon/WeaponGameDataMultiplier";

export default class BaseWeapon extends GameObject {
    private timeSinceLastShot: number = 0;
    private ammoClip: number = 10;
    private reloading: boolean = false;
    private weaponMultipliers!: Partial<WeaponGameData>;
    private weaponDataMultiplied!: WeaponGameData;
    private weaponData!: WeaponGameData;
    private weaponView!: WeaponViewData;
    private weaponSprite!: GameViewSprite;
    private currentReloadTime: number = 0;
    private level: integer = 2
    private areaMultiplyer: number = 1
    private currentTargets: Array<GameObject> = [];
    private target!: GameObject | undefined;
    private sensor!: Sensor;
    public masterOffset: Vector3 = new Vector3();;
    // private weaponRange!: WeaponRange;


    build(weaponData: WeaponGameData, weaponView: WeaponViewData): void {
        super.build();
        this.weaponData = weaponData;
        this.weaponView = weaponView;
        this.weaponDataMultiplied = { ...weaponData }

        this.ammoClip = this.weaponDataMultiplied.ammoClip || 50;
        this.reloading = false;
        this.timeSinceLastShot = 0;
        this.currentReloadTime = 0;
        this.areaMultiplyer = 1;

        this.weaponSprite = this.poolComponent(GameViewSprite, true)
        this.weaponSprite.view.anchor.set(0.5)
        this.weaponSprite.view.visible = true;
        this.weaponSprite.view.scale.set(this.weaponView.mainScale || 1)
        this.weaponSprite.viewScale.set(this.weaponView.mainScale || 1);
        const view = this.poolComponent(CardinalView) as CardinalView;
        view.build(this.weaponSprite, this.weaponView.weaponInGamePath, [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest])

        // this.sensor = this.poolGameObject(Sensor);
        // this.sensor.build(250)
        // //this.sensor.addDebug()
        // this.sensor.rigidBody.layerCategory = PhysicsLayers.Player
        // this.sensor.rigidBody.layerMask = PhysicMasks.PlayerCollision

        this.transform.lookAtAngle = -Math.PI / 2

    }

    setMultipliers(weaponDataMultiplier: Partial<WeaponGameData>) {
        const defaultData = { ...this.weaponData }

        this.weaponDataMultiplied = Object.keys(this.weaponData).reduce((acc, key) => {
            const typedKey = key as keyof WeaponGameData;
            if (weaponDataMultiplier[typedKey] !== undefined) {
                acc[typedKey] = (defaultData[typedKey] as number) * (weaponDataMultiplier[typedKey] as number);
            }else{
                acc[typedKey] = defaultData[typedKey];
            }
            return acc;
        }, {} as Partial<WeaponGameData>);

    }
    setAreaMultiplier(value: number) {
        this.areaMultiplyer = value;
    }
    setTargets(targets: Array<GameObject>) {
        this.currentTargets = targets;
    }
    update(delta: number, time: number): void {
        super.update(delta, time);

        if (!this.parent) {
            // this.weaponRange?.hide();
            return;
        }

        this.updateParentingPostion();
        let targetAngle = this.parent.transform.lookAtAngle;

        if (this.weaponDataMultiplied.angleOffset) {
            targetAngle += this.weaponDataMultiplied.angleOffset
        }


        if (this.weaponDataMultiplied.weaponShootType == WeaponShootType.ShootClosest) {
            const closetEnemies = GameObject.findClosestEntity(this.parent, this.currentTargets)
            if (!closetEnemies.entity) {
                return;
            }
            if (closetEnemies.distance > (this.weaponDataMultiplied.detectDistance || 1000) * this.areaMultiplyer) {
                return;
            }
            this.target = closetEnemies.entity;
            targetAngle = Vector3.atan2XZ(this.target.transform.position, this.transform.position);
        } else {
            this.target = undefined;
        }

        this.transform.lookAtAngle = MathUtils.lerpAngleRad(this.transform.lookAtAngle, targetAngle, 0.1)

        this.localX = this.weaponView.weaponOffset.x + Math.cos(this.transform.lookAtAngle) * this.weaponView.weaponOffsetDistance + this.masterOffset.x
        this.localZ = this.weaponView.weaponOffset.z + Math.sin(this.transform.lookAtAngle) * this.weaponView.weaponOffsetDistance + this.masterOffset.z
        this.y = this.weaponView.weaponOffset.y + this.masterOffset.y


        if (this.reloading) {
            this.currentReloadTime -= delta;
            if (this.currentReloadTime <= 0) {
                this.ammoClip = this.weaponDataMultiplied.ammoClip || 100;
                this.reloading = false;
                this.currentReloadTime = 0;
            }

            return;
        }

        this.timeSinceLastShot += delta;

        if (this.timeSinceLastShot >= (this.weaponDataMultiplied.shootFrequency || 1)) {
            if (this.ammoClip > 0) {
                this.shoot();
                this.ammoClip--//= this.bulletsPerShot;
                this.timeSinceLastShot = 0;
            } else {
                this.reloading = true;
                this.reload();
            }
        }
    }
    public reload(): void {
        this.reloading = true;
        this.currentReloadTime = this.weaponDataMultiplied.reloadTime || 0;
    }
    shoot() {
        //PARENTING IS BROKEN
        //console.log(this.weaponView.weaponShootDistance)
        const bullets = this.weaponDataMultiplied.bulletsPerShot || 1;
        for (let index = 0; index < bullets; index++) {

            const bullet = this.loggie.poolGameObject(BaseProjectile) as BaseProjectile;
            let ang = this.transform.lookAtAngle
            const baseNoise = this.weaponDataMultiplied.shootNoise || 0;
            const noise = baseNoise * Math.random() * 2 - baseNoise
            bullet.build(ang + noise, this.weaponDataMultiplied, this.weaponView, this.areaMultiplyer)
            bullet.rigidBody.x = this.x + Math.cos(ang) * this.weaponView.weaponShootDistance + this.weaponView.weaponOffset.x
            bullet.rigidBody.z = this.z + Math.sin(ang) * this.weaponView.weaponShootDistance + this.weaponView.weaponOffset.z
            bullet.y = this.y

            //console.log(bullet)
        }
        if (this.weaponView.shootVfx) {
            const oneShot = this.loggie.addNewGameObject(OneShotAnimation) as OneShotAnimation;
            oneShot.build(AnimationSet.Animations.get(this.weaponView.shootVfx), this.weaponView.shootVfxFps || 24)
            //oneShot.autoUpdateParentPosition = true;
            oneShot.gameView.view.anchor.set(0.5, 0.5)
            oneShot.gameView.view.rotation = this.transform.lookAtAngle
            oneShot.gameView.viewScale.set(1, 1)
            oneShot.x = this.transform.position.x + Math.cos(this.transform.lookAtAngle) * this.weaponView.weaponShootDistance + this.weaponView.weaponOffset.x
            oneShot.z = this.transform.position.z + Math.sin(this.transform.lookAtAngle) * this.weaponView.weaponShootDistance + this.weaponView.weaponOffset.z
            oneShot.y = this.y
        }
    }
    destroy(): void {
        super.destroy();
        //this.weaponRange.destroy();
    }
}