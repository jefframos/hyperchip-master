import { WeaponEnum } from "./WeaponEnum";
import { WeaponShootType } from "./WeaponShotType";

export type WeaponStaticData ={

    readonly type: WeaponEnum;
    readonly ammoClip: number[];
    readonly maxAmmo: number[];
    readonly bulletsPerShot: number[];
    readonly shootFrequency: number[];
    readonly shootNoise: number[];
    readonly reloadTime: number[];
    readonly shootDistance: number[];
    readonly piercing: number[];
    readonly kickback: number[];
    readonly damage: number[];
    readonly bulletSpeed: number[];
    readonly bulletRadius: number[];
    readonly detectDistance: number[];
    readonly angleOffset: number[];
    readonly weaponShootType: WeaponShootType;
}