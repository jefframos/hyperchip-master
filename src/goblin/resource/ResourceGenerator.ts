import * as PIXI from 'pixi.js';
import GridGenerator from '../grid/GridGenerator';
import ResourceManager, { ResourceSettings } from "./ResourceManager";
import { ResourceType } from './ResourceType';

export default class ResourceGenerator {
    private settings: ResourceSettings;
    private lastGenerationTime: number = 0;
    private lastBatchSpawnTime: number = 0;
    private resourcesToSpawn: number = 0;
    private availableTiles: PIXI.Point[] = [];

    constructor(settings: ResourceSettings) {
        this.settings = settings;
    }

    public update(currentTime: number, grid: GridGenerator, manager: ResourceManager): void {
        // Start batch generation if the generation time has elapsed and we are not currently generating a batch
        if (currentTime - this.lastGenerationTime >= this.settings.generationTime && this.resourcesToSpawn === 0) {
            this.startBatchGeneration(grid, manager);
            this.lastGenerationTime = currentTime;
        }

        // Generate resources in the batch based on batch spawn time
        if (this.resourcesToSpawn > 0 && currentTime - this.lastBatchSpawnTime >= this.settings.batchSpawnTime) {
            this.generateResource(manager);
            this.lastBatchSpawnTime = currentTime;
        }
    }

    private startBatchGeneration(grid: GridGenerator, manager: ResourceManager): void {
        this.availableTiles = this.findAvailableTiles(grid);
        const currentResourcesCount = manager.getCurrentResourceCount(this.settings.type);
        const maxResources = this.calculateMaxResources(grid);
        const maxNewResources = Math.min(this.availableTiles.length, maxResources - currentResourcesCount);
        this.resourcesToSpawn = Math.min(maxNewResources, this.settings.maxOnScreen - currentResourcesCount, this.settings.batchSize);
    }

    private generateResource(manager: ResourceManager): void {
        if (this.resourcesToSpawn > 0) {
            const randomIndex = Math.floor(Math.random() * this.availableTiles.length);
            const tile = this.availableTiles.splice(randomIndex, 1)[0];
            manager.createResource(tile, this.settings.type);
            this.resourcesToSpawn--;
        }
    }

    private findAvailableTiles(grid: GridGenerator): PIXI.Point[] {
        const availableTiles: PIXI.Point[] = [];
        const gridData = grid.getGridData();

        for (let x = 0; x < gridData.length; x++) {
            for (let y = 0; y < gridData[x].length; y++) {
                if (this.settings.allowedTiles.includes(gridData[x][y].tileType) && gridData[x][y].resourceType == ResourceType.Empty) {
                    availableTiles.push(new PIXI.Point(x, y));
                }
            }
        }

        return availableTiles;
    }

    private calculateMaxResources(grid: GridGenerator): number {
        const gridData = grid.getGridData();
        const gridSize = gridData.length;
        const tileArea = 10 * 10; // 10x10 tiles
        const numberOfAreas = Math.ceil(gridSize / 10) * Math.ceil(gridSize / 10);
        return numberOfAreas * this.settings.densityPerTileArea;
    }
}
