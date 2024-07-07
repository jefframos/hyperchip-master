import * as PIXI from 'pixi.js';

import Camera from 'loggie/core/camera/Camera';
import DraggablePanel from '../goblin/grid/DraggablePanel';
import GameObject from 'loggie/core/gameObject/GameObject';
import GameViewGraphics from 'loggie/core/view/GameViewGraphics';
import GameViewMesh from 'loggie/core/view/GameViewMesh';
import GameViewSprite from 'loggie/core/view/GameViewSprite';
import GameViewUtils from 'loggie/core/view/GameViewUtils';
import MathUtils from 'loggie/utils/MathUtils';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import SpringPosition from 'loggie/utils/SpringPosition';
import TestMesh1 from './TestMesh1';
import ViewUtils from 'loggie/utils/ViewUtils';

export default class HyperchipGame extends GameObject {
    private logo?: GameViewSprite;
    private topVignette?: GameViewSprite;
    private pinkMask?: GameViewSprite;
    private meshTest?: TestMesh1;

    private mapCenter!: GameObject;
    private cameraOffset: PIXI.Point = new PIXI.Point(0,0);
    private sprintRotation: SpringPosition = new SpringPosition();

    constructor() {
        super()
    }
    build() {
        super.build();

        this.pinkMask = GameViewUtils.makeSprite(this, PIXI.Texture.from('pink-mask'), RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.topVignette = GameViewUtils.makeSprite(this, PIXI.Texture.from('top-glow'), RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.logo = GameViewUtils.makeSprite(this, PIXI.Texture.from('logo'), RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.meshTest = this.poolGameObject(TestMesh1, true)

        const drag = this.poolGameObject(DraggablePanel, true, this.mapCenter) as DraggablePanel

        const mapMover = new PIXI.Point();
        this.mapCenter = this.poolGameObject(GameObject, true);
        //this.mapCenter.poolComponent(GameViewGraphics, true).view.beginFill(0xFF0000).drawCircle(0, 0, 10)
        drag.onDragStart.add(() => {
            //const targetPoint = this.loggie.mainCamera.pointToCamera(this.mapCenter.x, 0, this.mapCenter.z)
            mapMover.x = this.cameraOffset.x
            mapMover.y = this.cameraOffset.y
        })

        drag.onDragUpdate.add((x: number, y: number) => {
            const targetX = mapMover.x - x / Camera.Zoom
            const targetY = mapMover.y - y / Camera.Zoom
            if (MathUtils.distance(targetX, targetY, this.cameraOffset.x, this.cameraOffset.y) < 100) {
                this.sprintRotation.setTarget(x * 0.005, y * 0.005)
                this.cameraOffset.x = targetX
                this.cameraOffset.y = targetY
            }
        })

        drag.onDragEnd.add(() => {
            this.sprintRotation.setTarget(0, 0)
        })

    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        if (this.logo) {
            if (PIXI.isMobile.any) {

                this.logo.view.scale.set(ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.right * 0.4, this.loggie.overlay.right * 0.4))
            } else {

                this.logo.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.right * 0.2, this.loggie.overlay.right * 0.2)))
            }
        }

        this.sprintRotation.update(delta)
        // if (this.loggie.mainCamera instanceof PerspectiveCamera) {

        //     // this.loggie.mainCamera.transform.rotation.x = 50 + this.sprintRotation.getPosition().y;
        //     // this.loggie.mainCamera.transform.rotation.y = 20 + this.sprintRotation.getPosition().y;
        //     // this.loggie.mainCamera.transform.rotation.z = 20 + this.sprintRotation.getPosition().x;
        // }

        this.meshTest?.setTextureOffset(this.cameraOffset)
     
        //this.loggie.mainCamera.setFollowPoint(this.mapCenter.transform.position, true)
        //this.loggie.mainCamera.setCameraOffset(this.cameraOffset.x, this.cameraOffset.y)
        //this.loggie.mainCamera.setZoom(0.5)

        if (this.topVignette) {
            this.topVignette.view.width = this.loggie.overlay.right
        }
        if (this.pinkMask) {
            this.pinkMask.view.width = this.loggie.overlay.right
            this.pinkMask.view.height = this.loggie.overlay.down
            this.pinkMask.view.alpha = 0.5
        }
    }
}