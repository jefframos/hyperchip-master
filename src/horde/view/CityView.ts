import GameObject from 'loggie/core/gameObject/GameObject';
import Vector3 from 'loggie/core/gameObject/Vector3';
import { MeshConfig } from 'loggie/core/mesh/MeshUtils';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewMesh from 'loggie/core/view/GameViewMesh';
export default class CityView extends GameObject {
    private meshes: GameViewMesh[] = [];
    constructor() {
        super()
    }
    build() {
        super.build();


        const asphaltMeshConfig = { width: 710, height: 4000, segmentsX: 30, segmentsY: 30, anchor: new Vector3(0.5, 1, 0) } as MeshConfig
        const streetCenterMeshConfig = { width: 712, height: 5000, segmentsX: 20, segmentsY: 50, anchor: new Vector3(0.5, 1, 0) } as MeshConfig
        const streetSideLeftMeshConfig = { width: 1500, height: 5000, segmentsX: 20, segmentsY: 20, anchor: new Vector3(1, 1, 0) } as MeshConfig
        const streetSideRightMeshConfig = { width: 1500, height: 5000, segmentsX: 20, segmentsY: 20, anchor: new Vector3(0, 1, 0) } as MeshConfig

        const baseAsphalt = this.poolGameObject(GameObject) as GameObject
        baseAsphalt.autoUpdateParentPosition = true

        const asphaltMesh = baseAsphalt.poolComponent(GameViewMesh, true, 'Floor_AsphaltRoad_s.png', asphaltMeshConfig) as GameViewMesh
        asphaltMesh.setTextureSize(512, 256)
        asphaltMesh.layer = RenderLayers.Floor

        this.meshes.push(asphaltMesh);


        // const streetCenter = this.poolGameObject(GameObject) as GameObject
        // const streetCenterMesh = streetCenter.poolComponent(GameViewMesh, true, 'street-1.png', streetCenterMeshConfig) as GameViewMesh
        // streetCenter.autoUpdateParentPosition = true
        // streetCenterMesh.setTileScale(1, 1)
        // streetCenterMesh.layer = RenderLayers.Floor

        // this.meshes.push(streetCenterMesh);

        const streetLeft = this.poolGameObject(GameObject) as GameObject

        streetLeft.localX = -350
        streetLeft.localZ = -1
        streetLeft.y = -10

        streetLeft.autoUpdateParentPosition = true

        const streetLeftMesh = streetLeft.poolComponent(GameViewMesh, true, 'Floor_SidewalkPlates_d.png', streetSideLeftMeshConfig) as GameViewMesh
        streetLeftMesh.setTextureSize(256, 256)
        streetLeftMesh.setTileScale(0.1, 0.025)
        streetLeftMesh.layer = RenderLayers.Floor
        this.meshes.push(streetLeftMesh);


        const streetRight = this.poolGameObject(GameObject) as GameObject

        streetRight.localX = 350
        streetRight.y = -10
        streetRight.localZ = -1
        streetRight.autoUpdateParentPosition = true

        const streetRightMesh = streetRight.poolComponent(GameViewMesh, true, 'Floor_SidewalkPlates_d.png', streetSideRightMeshConfig) as GameViewMesh
        streetRightMesh.setTextureSize(256, 256)
        streetRightMesh.setTileScale(0.1, 0.025)
        streetRightMesh.layer = RenderLayers.Floor
        this.meshes.push(streetRightMesh);


    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

    }
}