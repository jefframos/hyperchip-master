import { EntityBehaviour, EntityType } from "./EntityStaticData";

export type EntityGameData = {

    readonly id: string;
    readonly type: EntityType;
    sharedEntityView: string;
    readonly behaviour: EntityBehaviour;
    readonly health: number;
    readonly defense: number;
    readonly attack: number;
    readonly speed: number;
}