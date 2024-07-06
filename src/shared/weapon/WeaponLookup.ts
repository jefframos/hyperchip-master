import { WeaponStaticData } from "./WeaponStaticData";
import { WeaponEnum } from "./WeaponEnum";
import { WeaponGameData } from "./WeaponGameData";
import { WeaponViewData } from "./WeaponViewData";
import { EntityDataUtils, IEntityDataLookup } from "../IEntityDataLookup";

export default class WeaponLookup implements IEntityDataLookup{
    static _instance: WeaponLookup;
    static get instance() {
        if (!WeaponLookup._instance) {
            WeaponLookup._instance = new WeaponLookup();
        }
        return WeaponLookup._instance;
    }
    constructor() {

    }
    private entityDataMap: Map<WeaponEnum, WeaponStaticData> = new Map();
    private entityViewMap: Map<WeaponEnum, WeaponViewData> = new Map();
    private entityMaxLevel: Map<WeaponEnum, integer> = new Map();

    addEntityData(weaponData: any) {
        const weapons: { weapons: WeaponStaticData[] } = weaponData
        weapons.weapons.forEach(element => {
            const enumType = EntityDataUtils.findEnumMemberByName(WeaponEnum, element.type) as WeaponEnum
            this.entityDataMap.set(enumType, element)

            for (const key in element) {
                if (Object.prototype.hasOwnProperty.call(element, key)) {
                    const attribute = element[key];
                    if (Array.isArray(attribute)) {
                        const currentLevel = this.entityMaxLevel.get(enumType)
                        if (currentLevel && currentLevel < attribute.length) {
                            this.entityMaxLevel.set(enumType, attribute.length)
                        }else if(!currentLevel){
                            this.entityMaxLevel.set(enumType, 1)
                        }
                    }

                }
            }
        });

       
    }
    addEntityViewData(weaponViewData: any){
        const weaponsView: { weapons: WeaponViewData[] } = weaponViewData
        weaponsView.weapons.forEach(element => {
            this.entityViewMap.set(this.findEnumMemberByName(WeaponEnum, element.type), element)
        });
    }
    findEnumMemberByName<T>(enumObj: T, name: string): T[keyof T] {
        return enumObj[name as keyof T];
    }
    getEntityMaxLevel(weapon: WeaponEnum): number {
        return this.entityMaxLevel.get(weapon) || 0
    }
    getEntity(weaponType: WeaponEnum): WeaponStaticData {
        return this.entityDataMap.get(weaponType)
    }
    getEntityView(weaponType: WeaponEnum): WeaponViewData {
        return this.entityViewMap.get(weaponType)
    }
    getLeveldEntityData(weaponId: WeaponEnum, level: integer): WeaponGameData {
        const weaponData = this.getEntity(weaponId);

        return EntityDataUtils.getLeveledData<WeaponGameData>(weaponData, level);

    }

}