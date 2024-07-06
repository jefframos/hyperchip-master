import * as PIXI from 'pixi.js';
import { ResourceType } from '../resource/ResourceType';
import { TileType } from '../resource/TileType';
export interface TileData {
    tileType: TileType; // Type of the tile (e.g., "grass", "water", etc.)
    life: number; // Life of the tile (e.g., if it's a resource)
    resourceType: ResourceType; // Type of resource on the tile (e.g., "tree", "stone", etc.)
}
export default class GridGenerator {
    private gridWidth: number;
    private gridHeight: number;
    private gridData: TileData[][];

    constructor(gridWidth: number, gridHeight: number = 5) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.gridData = [];

        this.generateGrid();
    }

    private generateGrid(): void {
        const width = Math.floor(this.gridWidth / 2);
        const height = Math.floor(this.gridHeight / 2);

        for (let x = -width; x <= width; x++) {
            this.gridData[x + width] = [];
            for (let y = -height; y <= height; y++) {
                this.gridData[x + width][y + height] = {
                    tileType: TileType.Grass,
                    life: 100,
                    resourceType: ResourceType.Empty
                }; // Initialize grid data with default values
            }
        }
    }
    public getCenterTile(): PIXI.Point {
        const centerIndex = Math.floor(this.gridWidth / 2);
        const centerJ = Math.floor(this.gridHeight / 2);
        return new PIXI.Point(centerIndex, centerJ);
    }
    public setTileData(x: number, y: number, data: TileData): void {
        if (this.gridData[x] && this.gridData[x][y]) {
            this.gridData[x][y] = data;
        }
    }

    public getTileData(x: number, y: number): TileData | null {
        if (this.gridData[x] && this.gridData[x][y]) {
            return this.gridData[x][y];
        }
        return null;
    }

    public getNeighbors(x: number, y: number): PIXI.Point[] {
        const neighbors: PIXI.Point[] = [];
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // Right, Left, Down, Up

        for (const [dx, dy] of directions) {
            const neighborX = x + dx;
            const neighborY = y + dy;
            if (this.gridData[neighborX] && this.gridData[neighborX][neighborY]) {
                neighbors.push(new PIXI.Point(neighborX, neighborY));
            }
        }

        return neighbors;
    }

    public getGridData(): TileData[][] {
        return this.gridData;
    }
}