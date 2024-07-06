import GameObject from 'loggie/core/gameObject/GameObject';
import { Signal } from 'signals';
import BaseWeapon from '../../shared/components/BaseWeapon';
import { WeaponEnum } from '../../shared/weapon/WeaponEnum';
import { WeaponGameData } from '../../shared/weapon/WeaponGameData';
import WeaponLookup from '../../shared/weapon/WeaponLookup';
export type WeaponLevel = {
    baseWeapon: BaseWeapon,
    level: integer
}
export type WeaponLevelData = {
    weaponType: WeaponEnum,
    level: integer
}
export type UpgradeData = {
    sessionWeapons: Map<WeaponEnum, WeaponLevel>
}
export default class WeaponUpgradeSystem {
    public onUpdateWeapons: Signal = new Signal();
    public sessionWeapons: Map<GameObject, UpgradeData> = new Map();
    public sessionMultipliers: Map<GameObject, Partial<WeaponGameData>> = new Map();
    public allWeapons: BaseWeapon[] = []

    public latestAddedWeapon!: WeaponLevelData | undefined;
    constructor() {
    }

    resetSystem() {
        this.sessionWeapons.clear();
        this.sessionMultipliers.clear();
        this.latestAddedWeapon = undefined;
        this.allWeapons = [];
    }
    addPlayerMultipliers(entity: GameObject, multiplier: Partial<WeaponGameData>) {
        if (this.sessionMultipliers.has(entity)) {
            const oldMultiplier = this.sessionMultipliers.get(entity);

            if (oldMultiplier) {

                const addedMultiplier = Object.keys(multiplier).reduce((acc, key) => {
                    const typedKey = key as keyof Partial<WeaponGameData>;
                    if (oldMultiplier[typedKey] !== undefined) {
                        acc[typedKey] = (oldMultiplier[typedKey] as number) * (multiplier[typedKey] as number);
                    }
                    return acc;
                }, {} as Partial<WeaponGameData>);
                this.sessionMultipliers.set(entity, addedMultiplier);
            }


        } else {
            this.sessionMultipliers.set(entity, multiplier);
        }

        this.applyWeaponMultipliers(entity);
    }

    applyUpdateCard(entity: GameObject, type: WeaponEnum): BaseWeapon | null {
        const target = type ? type : WeaponEnum.Pistol
        const upgradeData = this.sessionWeapons.get(entity)
        const weaponToUpgrade = upgradeData?.sessionWeapons.get(target)

        if (weaponToUpgrade) {
            if (weaponToUpgrade.level >= WeaponLookup.instance.getEntityMaxLevel(target) - 1) {
                return null;
            }
            weaponToUpgrade.baseWeapon.destroy();
            this.allWeapons.filter(weapon => !weapon.destroyed)
            return this.addPlayerWeapon(entity, target, ++weaponToUpgrade.level)
        } else {
            return this.addPlayerWeapon(entity, target, 0)
        }

    }
    applyWeaponMultipliers(entity: GameObject) {
        const multipliers = this.sessionMultipliers.get(entity)
        const weapon = this.sessionWeapons.get(entity)
        if (multipliers && weapon) {
            for (const [key, value] of weapon.sessionWeapons) {
                value.baseWeapon.setMultipliers(multipliers);
            }
        }
    }
    addPlayerWeapon(entity: GameObject, weaponType: WeaponEnum, level: integer): BaseWeapon {

        const gameplayWeapon = WeaponLookup.instance.getLeveldEntityData(weaponType, level)
        const weaponView = WeaponLookup.instance.getEntityView(weaponType)
        const weapon = entity.addNewGameObject(BaseWeapon) as BaseWeapon
        weapon.build(gameplayWeapon, weaponView)

        this.allWeapons.push(weapon);
        if (!this.sessionWeapons.get(entity)) {
            this.sessionWeapons.set(entity, { sessionWeapons: new Map() })
        }
        this.sessionWeapons.get(entity)?.sessionWeapons.set(weaponType, { baseWeapon: weapon, level: level })

        this.latestAddedWeapon = { weaponType: weaponType, level: level };
        this.applyWeaponMultipliers(entity);
        this.onUpdateWeapons.dispatch(this.sessionWeapons);

        console.log(this.sessionWeapons)

        return weapon;
    }
}