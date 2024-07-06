
import { EntityDataUtils, IEntityDataLookup } from "../IEntityDataLookup";
import { EntityGameData } from "./EntityGameData";
import { EntityStaticData } from "./EntityStaticData";
import { EntityViewData } from "./EntityViewData";

export default class EntityLookup implements IEntityDataLookup{
    static _instance: EntityLookup;
    static get instance() {
        if (!EntityLookup._instance) {
            EntityLookup._instance = new EntityLookup();
        }
        return EntityLookup._instance;
    }
    constructor() {

    }
    private entityDataMap: Map<string, EntityStaticData> = new Map();
    private entityViewMap: Map<string, EntityViewData> = new Map();
    private entityMaxLevel: Map<string, integer> = new Map();

    addEntityData(entityData: any) {
        const entities: { entity: EntityStaticData[] } = entityData
        entities.entity.forEach(element => {
            const entityId = element.id
            this.entityDataMap.set(entityId, element)

            for (const key in element) {
                if (Object.prototype.hasOwnProperty.call(element, key)) {
                    const attribute = element[key];
                    if (Array.isArray(attribute)) {
                        const currentLevel = this.entityMaxLevel.get(entityId)
                        if (currentLevel && currentLevel < attribute.length) {
                            this.entityMaxLevel.set(entityId, attribute.length)
                        }else if(!currentLevel){
                            this.entityMaxLevel.set(entityId, attribute.length)
                        }
                    }

                }
            }
        });

    }
    
    addEntityViewData(entityViewData: any){
        const entitiView: { entity: EntityViewData[] } = entityViewData
        entitiView.entity.forEach(element => {
            this.entityViewMap.set(element.id, element)
        });
    }

    getEntityMaxLevel(entityId: string): number {
        return this.entityMaxLevel.get(entityId) || 0
    }
    getEntity(entityId: string): EntityStaticData {
        return this.entityDataMap.get(entityId)
    }
    getEntityView(entityId: string): EntityViewData {
        return this.entityViewMap.get(entityId)
    }
    getLeveldEntityData(entityId: string, level: integer): EntityGameData {
        const entityData = this.getEntity(entityId);

        const gameData = EntityDataUtils.getLeveledData<EntityGameData>(entityData, level);
        if(entityData.sharedEntityView?.length){
            gameData.sharedEntityView = entityData.sharedEntityView[Math.floor(Math.random()*entityData.sharedEntityView.length)]
        }
        return gameData;

    }

}