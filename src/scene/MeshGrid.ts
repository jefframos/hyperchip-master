import GameObject from 'loggie/core/gameObject/GameObject';
import * as PIXI from 'pixi.js';
import DragHandler from './DragHandler';
import MainTiledMesh from './MainTiledMesh';
export default class MeshGrid extends GameObject {
    private meshGrid: MainTiledMesh[] = [];
    private cellSize: number = 512;
    private textures: string[] = []
    private rows: number = 5;
    private cols: number = 5;
    private dragHandler?: DragHandler;
    constructor() {
        super()
    }
    build() {
        super.build();

        this.textures = ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4', 'Layer 5', 'Layer 6']

        this.dragHandler = new DragHandler();

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const textureIndex = (col + row * this.cols) % this.textures.length;
                const mesh = this.poolGameObject(MainTiledMesh, true, this.textures[textureIndex], this.cellSize);
                this.meshGrid.push(mesh)

                mesh.x = (col - Math.floor(this.cols / 2)) * this.cellSize;
                mesh.z = (row - Math.floor(this.rows / 2)) * this.cellSize;
            }
        }

    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        this.setOffset(this.dragHandler?.getVelocity(), 5)
    }
    setOffset(offset: PIXI.Point, scale: number = 1) {

        let index = 0;
        const dist = this.cellSize * 5
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const mesh = this.meshGrid[index];

                //mesh.x = (col - Math.floor(this.cols / 2)) * this.cellSize //- offset.x;
                mesh.x += offset.x * scale;
                mesh.z += offset.y * scale;



                if (mesh.x < - dist) {
                    mesh.x += dist
                } if (mesh.x > dist) {
                    mesh.x -= dist
                }

                if (mesh.z < - dist) {
                    mesh.z += dist
                } if (mesh.z > dist) {
                    mesh.z -= dist
                }
                index++;
            }
        }
    }

}