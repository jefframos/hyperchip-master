
import { EntityStaticData } from "../../../shared/entity/EntityStaticData";

export enum SpawnLocation {
    Top = 0,
    Down = 1,
    Left = 2,
    Right = 3,
    Anywhere = 4
}

export interface SpawnerOptions {
    enemyTypes: EntityStaticData[];
    enemyLevel: number;
    maxEnemies: number;
    spawnLocation: SpawnLocation;
}

export interface SpawnData {
    enemy: EntityStaticData;
    positionX: number;
    positionY: number;
}