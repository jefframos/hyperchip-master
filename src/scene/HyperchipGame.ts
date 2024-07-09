import * as PIXI from 'pixi.js';

import PerspectiveCamera from 'loggie/core/camera/PerspectiveCamera';
import GameObject from 'loggie/core/gameObject/GameObject';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import GameViewSprite from 'loggie/core/view/GameViewSprite';
import GameViewUtils from 'loggie/core/view/GameViewUtils';
import Spring from 'loggie/utils/Spring';
import SpringPosition from 'loggie/utils/SpringPosition';
import ViewUtils from 'loggie/utils/ViewUtils';
import MeshGrid from './MeshGrid';

export default class HyperchipGame extends GameObject {
    private logo?: GameViewSprite;
    private topVignette?: GameViewSprite;
    private pinkMask?: GameViewSprite;
    private meshGrid?: MeshGrid;

    private mapCenter!: GameObject;
    private debug!: GameObject;
    private text: PIXI.Text = new PIXI.Text();;
    private debugContainer!: GameViewContainer
    private cameraOffset: PIXI.Point = new PIXI.Point(0, 0);
    private worldVelocity: PIXI.Point = new PIXI.Point(0, 0);
    private sprintRotation: SpringPosition = new SpringPosition();

    private targetFov = 130
    private springPov: Spring = new Spring(800, 25, 1)
    private perspCamera?: PerspectiveCamera;
    private worldCollapsed: boolean = false;

    constructor() {
        super()
    }
    build() {
        super.build();

        this.pinkMask = GameViewUtils.makeSprite(this, PIXI.Texture.from('pink-mask'), RenderLayers.FrontLayer).findComponent<GameViewSprite>(GameViewSprite)
        this.pinkMask.ignoreCameraPerspective = true;
        this.pinkMask.ignoreCameraScale = true;
        this.pinkMask.view.anchor.set(0.5)
        this.topVignette = GameViewUtils.makeSprite(this, PIXI.Texture.from('top-glow'), RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.logo = GameViewUtils.makeSprite(this, PIXI.Texture.from('logo'), RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.meshGrid = this.poolGameObject(MeshGrid, true)


        const mapMover = new PIXI.Point();
        this.debug = this.poolGameObject(GameObject, true);
        const container = this.debug.poolComponent(GameViewContainer, true, RenderLayers.UILayerOverlay)
        container.addChild(this.text)
        this.text.text = 'TESTE'
        this.debug.x = 300
        this.mapCenter = this.poolGameObject(GameObject, true);
        //this.mapCenter.poolComponent(GameViewGraphics, true).view.beginFill(0xFF0000).drawCircle(0, 0, 10)   

        this.springPov.setPosition(130)
        this.springPov.setTarget(130)
        this.logo.view.interactive = true;
        this.logo.view.cursor = 'pointer'
        this.logo.view.onpointerup = (e) => {
            this.worldCollapsed = !this.worldCollapsed;

            this.meshGrid.moveToId(2)
        }

        if (this.loggie.mainCamera instanceof PerspectiveCamera) {
            this.perspCamera = this.loggie.mainCamera as PerspectiveCamera;
        }

    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        if (this.logo) {
            if (PIXI.isMobile.any) {

                this.logo.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.right * 0.4, this.loggie.overlay.right * 0.4)))
            } else {

                this.logo.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.right * 0.2, this.loggie.overlay.right * 0.2)))
            }
        }

        this.springPov.update(delta);
        if (this.perspCamera) {
            this.perspCamera.cameraAttributes.fov = this.springPov.getPosition();
        }
        this.sprintRotation.update(delta)

        if (this.worldCollapsed) {
            this.springPov.setTarget(-100)
        } else {
            this.springPov.setTarget(130)

        }
        // if (this.loggie.mainCamera instanceof PerspectiveCamera) {

        //     // this.loggie.mainCamera.transform.rotation.x = 50 + this.sprintRotation.getPosition().y;
        //     // this.loggie.mainCamera.transform.rotation.y = 20 + this.sprintRotation.getPosition().y;
        //     // this.loggie.mainCamera.transform.rotation.z = 20 + this.sprintRotation.getPosition().x;
        // }

        //this.meshGrid?.setOffset(this.worldVelocity)
        //this.meshGrid?.setOffset(this.cameraOffset)

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