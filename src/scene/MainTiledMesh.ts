import * as PIXI from 'pixi.js';

import { MeshConfig } from 'loggie/core/mesh/MeshUtils';

import GameObject from 'loggie/core/gameObject/GameObject';
import Vector3 from 'loggie/core/gameObject/Vector3';
import MathUtils from 'loggie/utils/MathUtils';
import WorldMeshComponent from './WorldMeshComponent';

export default class MainTiledMesh extends GameObject {

    public tiled: PIXI.Point = new PIXI.Point()
    private worldMesh!: WorldMeshComponent;
    private segments: number = 7

    constructor() {
        super()


    }
    build(textureId: string, textSize: number = 512) {
        super.build();
        this.worldMesh = this.poolComponent(WorldMeshComponent)



        const meshConfig: MeshConfig = { width: textSize, height: textSize, segmentsX: this.segments - 1, segmentsY: this.segments - 1, anchor: new Vector3(0.5, 0.5, 0) } as MeshConfig


        this.worldMesh.build('Layer 1', meshConfig)

        const indices: number[] = [];
        for (let index = 0; index < this.worldMesh.mesh.geometry.getBuffer('aUvs').data.length; index++) {
            indices.push(this.worldMesh.mesh.geometry.getBuffer('aUvs').data[index])
        }

        const texture = PIXI.Texture.from(textureId);
        this.worldMesh.setTextureSize(textSize, textSize)

        const w1 = texture._uvs.x1 - texture._uvs.x0
        const h1 = texture._uvs.y3 - texture._uvs.y0
        // Calculate the number of segments
        const a = this.segments;
        const b = this.segments;
        const offsetX = 0;
        const offsetY = 0;
        for (let x = 0; x < a; x++) {
            for (let y = 0; y < b; y++) {

                var index = ((offsetX + x) * (this.segments) + (offsetY + y)) * 2;

                var u = w1 * (y / (a - 1)) + texture._uvs.x0;
                var v = h1 * (x / (b - 1)) + texture._uvs.y0;

                indices[index] = u;
                indices[index + 1] = v;
            }
        }
        this.worldMesh.mesh.geometry.getBuffer('aUvs').update(indices);
    }
    setTextureOffset(offset: PIXI.Point) {
        this.worldMesh.textureOffset.x = MathUtils.lerp(this.worldMesh.textureOffset.x, offset.x / 1000, 0.2)
        this.worldMesh.textureOffset.y = MathUtils.lerp(this.worldMesh.textureOffset.y, offset.y / 1000, 0.2)
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);
    }
}