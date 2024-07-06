export interface IEntityDataLookup {
    addEntityData(data: any): void,
    addEntityViewData(viewData: any): void,
    getEntityMaxLevel(type: any): number
    getEntity(type: any): any
    getEntityView(type: any): any
    getLeveldEntityData(type: any, level: integer): any
}

export module EntityDataUtils {
    export function findEnumMemberByName<T>(enumObj: T, name: string): T[keyof T] | undefined {
        return enumObj[name as keyof T];
    }
    export function extract(object: any, attName: string, level: integer): number {
        return object[attName] ? object[attName][Math.min(level, object[attName].length - 1)] : 0;
    }
    export function getLeveledData<T>(data: any, level: integer): T {
        const copy = {...data}
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const element = data[key];
                if (Array.isArray(element)) {
                    copy[key] = EntityDataUtils.extract(data, key, level)
                } else {
                    copy[key] = element;
                }
            }
        }
        return copy as T
    }
}