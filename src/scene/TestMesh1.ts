import * as PIXI from 'pixi.js';

import MeshUtils, { MeshConfig } from 'loggie/core/mesh/MeshUtils';

import GameObject from 'loggie/core/gameObject/GameObject';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import MathUtils from 'loggie/utils/MathUtils';
import Vector3 from 'loggie/core/gameObject/Vector3';
import WorldMeshComponent from './WorldMeshComponent';

export default class TestMesh1 extends GameObject {
    
    public tiled:PIXI.Point = new PIXI.Point()
    private worldMesh!: WorldMeshComponent;
    constructor() {
        super()

        this.worldMesh = this.poolComponent(WorldMeshComponent)


         const meshConfig: MeshConfig = { width: 2048, height: 2048, segmentsX: 50, segmentsY: 50, anchor: new Vector3(0.5, 0.5, 0) } as MeshConfig
        
        this.worldMesh.build('tiles1.png',meshConfig)
        this.worldMesh.setTextureSize(256,256)
        this.worldMesh.view.scale.set(1)
    }
    build() {
        super.build();
    }
    setTextureOffset(offset:PIXI.Point){
        this.worldMesh.textureOffset.x = MathUtils.lerp(this.worldMesh.textureOffset.x,offset.x / 1000, 0.2)
        this.worldMesh.textureOffset.y = MathUtils.lerp(this.worldMesh.textureOffset.y,offset.y / 1000, 0.2)
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        //this.worldMesh.textureOffset.x += delta
    }
}