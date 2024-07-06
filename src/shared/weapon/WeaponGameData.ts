import { WeaponEnum } from "./WeaponEnum";
import { WeaponShootType } from "./WeaponShotType";

export type WeaponGameData = {

    type?: WeaponEnum;
    ammoClip?: number;
    maxAmmo?: number;
    bulletsPerShot?: number;
    shootFrequency?: number;
    shootNoise?: number;
    reloadTime?: number;
    shootDistance?: number;
    piercing?: number;
    kickback?: number;
    damage?: number;
    bulletSpeed?: number;
    bulletRadius?: number;
    detectDistance?: number;
    angleOffset?: number;
    weaponShootType?: WeaponShootType;
}