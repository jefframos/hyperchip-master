import GameObject from 'loggie/core/gameObject/GameObject';
import Vector3 from 'loggie/core/gameObject/Vector3';
import { MeshConfig } from 'loggie/core/mesh/MeshUtils';
import GameViewMesh from 'loggie/core/view/GameViewMesh';
import * as PIXI from 'pixi.js';
import { TileData } from './GridGenerator';
export interface GridCorners {
    topLeft: PIXI.Point;
    topRight: PIXI.Point;
    bottomLeft: PIXI.Point;
    bottomRight: PIXI.Point;
}
export default class GridRenderer extends GameObject {
    private tileWidth: number = 0;
    private tileHeight: number = 0;
    private gridData: TileData[][] = [];
    private tileSprites: GameObject[][] = [];
    public baseMesh!: GameViewMesh;
    build(gridData: TileData[][], tileSize: number = 150) {
        super.build();
        this.gridData = gridData;

        // Create a container to hold the grid sprites

        // Calculate the width and height of each tile
        this.tileWidth = tileSize;
        this.tileHeight = tileSize;
        this.renderGrid();
    }

    private renderGrid(): void {

        const goTile = this.poolGameObject(GameObject, true)
        // Additional rendering logic can be applied here based on tileData
        const i = this.gridData.length
        const j = this.gridData[0].length
        this.baseMesh = goTile.poolComponent(GameViewMesh, true, 'grass-patch-1.png', { width: i * this.tileWidth, height: j * this.tileHeight, segmentsX: i, segmentsY: j, anchor: new Vector3(0, 0, 0) } as MeshConfig) as GameViewMesh;
        goTile.x = -this.tileWidth / 2
        goTile.z = -this.tileHeight / 2

        this.baseMesh.setTileScale(0.1, 0.1)
        for (let x = 0; x < this.gridData[0].length; x++) {
            this.tileSprites[x] = [];
            for (let y = 0; y < this.gridData.length; y++) {
                const tileData = this.gridData[x][y];
                const tileSprite = this.createTileSprite(x, y, tileData);
                //console.log(tileSprite)
                this.tileSprites[x][y] = tileSprite;
            }
        }
    }

    private createTileSprite(x: number, y: number, tileData: TileData): GameObject {
        const goTile = this.poolGameObject(GameObject, true)
        goTile.x = (x) * this.tileWidth; // Center of the tile
        goTile.z = (y) * this.tileHeight; // Center of the tile
        // Additional rendering logic can be applied here based on tileData
        // const mesh = goTile.poolComponent(GameViewMesh, true, 'grass-patch-1.png', { width: 120, height: 120, segmentsX: 2, segmentsY: 2, anchor: new Vector3(0.5, 0.5, 0) } as MeshConfig) as GameViewMesh;
        // const container = goTile.poolComponent(GameViewContainer, true)
        // const text = new PIXI.Text(`${x} - ${y}`, Fonts.mainStyle)
        // container.view.addChild(text)

        return goTile;
    }

    public getTilePosition(x: number, y: number): PIXI.Point | null {
        if (x >= 0 && x < this.tileSprites[0].length && y >= 0 && y < this.tileSprites.length) {
            const sprite = this.getTileSprite(x, y)
            if (!sprite) {
                return null;
            }
            const tilePosition = new PIXI.Point();
            tilePosition.x = sprite.x //+ sprite.width * (0.5 - sprite.anchor.x);
            tilePosition.y = sprite.z //+ sprite.height * (0.5 - sprite.anchor.y);
            return tilePosition;
        }
        return null;
    }

    public getTileSprite(x: number, y: number): GameObject | null {
        if (x >= 0 && x < this.tileSprites[0].length && y >= 0 && y < this.tileSprites.length) {
            return this.tileSprites[x][y];
        }
        return null;
    }

    calculateGridBounds(): PIXI.Rectangle {
        const i = this.gridData.length
        const j = this.gridData[0].length

        const width = j * this.tileWidth;
        const height = i * this.tileHeight;

        return new PIXI.Rectangle(0, 0, width, height);
    }

    getGridCorners(): GridCorners {
        const bounds = this.calculateGridBounds();

        const topLeft = new PIXI.Point(bounds.x, bounds.y);
        const topRight = new PIXI.Point(bounds.x + bounds.width, bounds.y);
        const bottomLeft = new PIXI.Point(bounds.x, bounds.y + bounds.height);
        const bottomRight = new PIXI.Point(bounds.x + bounds.width, bounds.y + bounds.height);

        return { topLeft, topRight, bottomLeft, bottomRight };
    }
}