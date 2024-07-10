import gsap, { Back } from 'gsap';
import GameObject from 'loggie/core/gameObject/GameObject';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import MathUtils from 'loggie/utils/MathUtils';
import * as PIXI from 'pixi.js';
import { Signal } from 'signals';
import BitmapTextButton from './BitmapTextButton';
import MainTiledMesh from './MainTiledMesh';
export default class GameInfoPanel extends GameObject {
    public panelContainer!: GameViewContainer;
    public snapMesh!: MainTiledMesh;
    public gameTexture: PIXI.Sprite = new PIXI.Sprite();
    public panelShadow!: PIXI.NineSlicePlane;
    public panel!: PIXI.NineSlicePlane;
    public closeButton!: BitmapTextButton;
    public onHidePanel: Signal = new Signal();

    constructor() {
        super()
    }
    build() {
        super.build();

        this.panelContainer = this.poolComponent(GameViewContainer, true, RenderLayers.FrontOverlayLayer)

        this.panelShadow = new PIXI.NineSlicePlane(PIXI.Texture.from('panel-shadow'), 50, 50, 50, 50);
        this.panelShadow.width = 512 * 1.2
        this.panelShadow.height = 720 * 1.2

        this.panelShadow.x = -this.panelShadow.width / 2
        this.panelShadow.y = -this.panelShadow.height / 2

        this.panelContainer.addChild(this.panelShadow)

        this.panel = new PIXI.NineSlicePlane(PIXI.Texture.from('panel-rect'), 50, 50, 50, 50);
        // this.panel.scale.set(5)
        this.panel.width = 512
        this.panel.height = 720
        this.panel.tint = 0xfd5392;

        this.panel.x = -this.panel.width / 2
        this.panel.y = -this.panel.height / 2

        this.panelContainer.addChild(this.panel)

        this.gameTexture.texture = PIXI.Texture.EMPTY
        this.gameTexture.anchor.set(0.5)
        this.gameTexture.scale.set(5)
        this.panelContainer.addChild(this.gameTexture)

        this.closeButton = this.poolComponent(BitmapTextButton, true)
        this.panelContainer.addChild(this.closeButton.container)
        this.panelContainer.view.visible = false;

        this.closeButton.container.x = -this.panel.width / 2 + 20
        this.closeButton.container.y = -this.panel.height / 2

        this.closeButton.onClick.add(() => {
            this.onHidePanel.dispatch();
        })

    }
    setPanelColor(color: number) {
        this.panel.tint = color;
    }
    snapToMesh(mesh: MainTiledMesh) {
        this.snapMesh = mesh;
        this.x = this.snapMesh.x
        this.z = this.snapMesh.z
    }
    hideSection() {
        gsap.killTweensOf(this.panelContainer.view)
        gsap.killTweensOf(this.panelContainer.view.scale)
        gsap.to(this.panelContainer.view, {
            duration: 0.5, alpha: 0, onComplete: () => {
                this.panelContainer.view.visible = false;
            }
        })
    }
    showSection() {
        gsap.killTweensOf(this.panelContainer.view)
        gsap.killTweensOf(this.panelContainer.view.scale)
        this.panelContainer.view.visible = true;
        this.panelContainer.view.alpha = 0
        gsap.to(this.panelContainer.view, { duration: 0.5, alpha: 1, delay: 0.5 })
        gsap.to(this.panelContainer.view.scale, { duration: 0.8, x: 1.5, y: 1.5, delay: 0.5, ease: Back.easeOut })
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        if (this.snapMesh) {
            this.x = MathUtils.lerp(this.x, this.snapMesh.x, 0.2)
            this.z = MathUtils.lerp(this.z, this.snapMesh.z, 0.2)
        }
    }
}