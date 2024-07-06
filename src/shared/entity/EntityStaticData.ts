export enum EntityBehaviour {
    Standard = 1,
}
export enum EntityType {
    Player = 1,
    Enemy = 2,
    Boss = 3
}
export type EntityStaticData = {
    readonly id: string;
    readonly type: EntityType;
    readonly sharedEntityView: string[];
    readonly behaviour: EntityBehaviour;
    readonly health: number[];
    readonly defense: number[];
    readonly attack: number[];
    readonly speed: number[];
}