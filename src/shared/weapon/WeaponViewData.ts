import { WeaponEnum } from "./WeaponEnum";

export type WeaponViewData = {

    readonly type: WeaponEnum;
    readonly shootVfx: string;
    readonly shootVfxFps: integer;
    readonly impactVfx: string;
    readonly impactVfxFps: integer;
    readonly bulletView: string;
    readonly weaponIcon: string;
    readonly weaponInGamePath: string;
    readonly weaponOffset: { x: 0, y: 0 , z:0};
    readonly weaponShootDistance:number;
    readonly weaponOffsetDistance:number;
    readonly mainScale:number;
}