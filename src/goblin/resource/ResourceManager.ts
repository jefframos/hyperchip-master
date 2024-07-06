import GameObject from 'loggie/core/gameObject/GameObject';
import * as PIXI from 'pixi.js';
import GridGenerator from '../grid/GridGenerator';
import BreakableResource from '../interactables/BreakableResource';
import CollectableResource from '../interactables/CollectableResource';
import ResourceCollectableSpawner, { LootTableData } from './ResourceCollectableSpawner';
import ResourceGenerator from './ResourceGenerator';
import { ResourceType } from './ResourceType';
import { TileType } from './TileType';
export interface Resource {
    type: string;
    position: PIXI.Point;
    health?: number;
    grow?: number;
    growTime?: number;
    growStartTime?: number;
}

export interface ResourceSettings {
    type: string;
    allowedTiles: TileType[];
    densityPerTileArea: number; // Density per 10x10 tiles
    maxOnScreen: number;
    generationTime: number; // Time in milliseconds
    batchSpawnTime: number; // Time in milliseconds for batch spawning
    batchSize: number; // Number of resources to spawn in a batch
}

export interface InGameResource {
    resource: Resource;
    gameObject: GameObject;
}

export interface LootTableEntry {
    type: string;
    chance: number;
    minAmount: number;
    maxAmount: number;
    forceToSpawn?: boolean;
}
export default class ResourceManager extends GameObject {
    private grid!: GridGenerator;
    private resources: Map<number, InGameResource> = new Map();
    private generators: ResourceGenerator[] = [];
    private lootTables: { [resourceType: string]: LootTableData } = {};
    private collectables: Map<number, InGameResource> = new Map();

    build(grid: GridGenerator, emptyTileCount: number = 50) {
        super.build();
        this.grid = grid;
    }

    addGenerator(settings: ResourceSettings): void {
        const generator = new ResourceGenerator(settings);
        this.generators.push(generator);
    }

    getLootTable(resourceType: string): LootTableData | undefined {
        return this.lootTables[resourceType];
    }

    setLootTable(resourceType: string, lootTable: LootTableData): void {
        this.lootTables[resourceType] = lootTable;
    }

    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);
        const currentTime = Date.now();

        // // Update collectables
        // this.collectables.forEach((collectable, guid) => {
        //     // Check if the collectable is collected and free up the tile
        //     if (collectable.isCollected()) {
        //         this.grid.setTileData(collectable.position.x, collectable.position.y, { type: TileType.Grass, life: 100, resourceType: null });
        //         this.collectables.delete(guid);
        //     }
        // });

        // Update resources
        // this.resources.forEach((data, guid) => {
        //     if (data.resource.health <= 0) {
        //         // Remove dead resource
        //         this.removeResource(guid);
        //         // Spawn loot

        //     } else {
        //         // Update growth
        //         const elapsedTime = currentTime - data.resource.growStartTime;
        //         data.resource.grow = Math.min(1, elapsedTime / data.resource.growTime);
        //     }
        // });

        // Update each generator
        this.generators.forEach(generator => {
            generator.update(currentTime, this.grid, this);
        });
    }

    private removeResource(guid: number): void {
        const data = this.resources.get(guid);
        if (data) {
            // Remove resource from map
            data.gameObject.destroy();
            this.resources.delete(guid);

            //TODO: REMOVES LOOT FOR NOW
            const table = this.getLootTable(data.resource.type)
            this.grid.setTileData(data.resource.position.x, data.resource.position.y, { tileType: TileType.Grass, life: 100, resourceType: ResourceType.Empty });
            if (table) {
                const loot = ResourceCollectableSpawner.generateLoot(data.resource, table);
                //console.log(loot)
                loot.forEach(item => this.spawnLoot(item, data.resource.position));
            }
        }
    }
    private spawnLoot(item: { type: string, amount: number }, position: PIXI.Point): void {
        const interactable = this.poolGameObject(CollectableResource, true) as CollectableResource;
        interactable.x = position.x * 100;
        interactable.z = position.y * 100;
        interactable.setUpView();
        interactable.onCollect.add((damage) => {
            this.handleLootPickup(interactable.GUID, damage);
        });

        const resource: Resource = {
            type: item.type,
            health: 100, // Starting health
            position,
            grow: 0
        };

        this.collectables.set(interactable.GUID, { resource, gameObject: interactable });
        this.grid.setTileData(position.x, position.y, { tileType: TileType.Grass, life: 100, resourceType: ResourceType.Loot });
    }
    public createResource(position: PIXI.Point, resourceType: ResourceType, growTime: number): void {
        const interactable = this.poolGameObject(BreakableResource, true) as BreakableResource;
        interactable.x = position.x * 100;
        interactable.z = position.y * 100;
        interactable.setUpView();

        const resource: Resource = {
            type: resourceType,
            health: 100, // Starting health
            position,
            grow: 0,
            growTime,
            growStartTime: Date.now()
        };

        interactable.onRemove.add((damage) => {
            this.handleResourceDamage(interactable.GUID,);
        });

        // Update grid data
        this.grid.setTileData(position.x, position.y, { tileType: TileType.Grass, life: 100, resourceType });

        // Add resource and game object to the map
        this.resources.set(interactable.GUID, { resource, gameObject: interactable });
    }

    private handleResourceDamage(guid: number): void {
        const data = this.resources.get(guid);
        if (data) {
            this.removeResource(guid);
        }
    }
    private removeLoot(guid: number): void {
        const data = this.collectables.get(guid);
        if (data) {
            // Remove resource from map
            data.gameObject.destroy();
            this.collectables.delete(guid);

            this.grid.setTileData(data.resource.position.x, data.resource.position.y, { tileType: TileType.Grass, life: 100, resourceType: ResourceType.Empty });
        }
    }
    private handleLootPickup(guid: number, damage: number): void {
        const data = this.collectables.get(guid);
        if (data) {
            this.removeLoot(guid);
        }
    }
    public getCurrentResourceCount(resourceType: string): number {
        let count = 0;
        this.resources.forEach((data) => {
            if (data.resource.type === resourceType) {
                count++;
            }
        });
        return count;
    }
}