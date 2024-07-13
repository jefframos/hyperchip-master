import * as PIXI from 'pixi.js';

import gsap, { Back } from 'gsap';

import BitmapTextButton from '../BitmapTextButton';
import Footer from './Footer';
import GameContent from './GameContent';
import { GameData } from '../HyperchipGame';
import GameObject from 'loggie/core/gameObject/GameObject';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import Header from './Header';
import MainTiledMesh from '../MainTiledMesh';
import MathUtils from 'loggie/utils/MathUtils';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import ScreenInfo from 'loggie/core/screen/ScreenInfo';
import { Signal } from 'signals';

export default class GameInfoPanel extends GameObject {
    public panelContainer!: GameViewContainer;
    public snapMesh!: MainTiledMesh;
    public cloneMesh!: MainTiledMesh;
    public gameTexture: PIXI.Sprite = new PIXI.Sprite();
    public panelShadow!: PIXI.NineSlicePlane;
    public panel!: PIXI.NineSlicePlane;
    public closeButton!: BitmapTextButton;
    public currentSection!: GameData;
    public footer: Footer = new Footer();
    public header!: Header;
    public content: GameContent = new GameContent();
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




        // this.cloneMesh = this.poolGameObject(MainTiledMesh, true, 'Layer 1') as MainTiledMesh
        // this.cloneMesh.worldMesh.layer = RenderLayers.UILayerOverlay

        this.panelContainer.addChild(this.panel)

        this.gameTexture.texture = PIXI.Texture.EMPTY
        this.gameTexture.anchor.set(0.5)
        this.panelContainer.addChild(this.gameTexture)


        this.panelContainer.addChild(this.footer)
        this.panelContainer.addChild(this.content)


        this.closeButton = this.poolComponent(BitmapTextButton, true, 'X', 0xFFFFFF, 0xE72264)
        this.closeButton.setDefaultPanelColor(0xE72264)
        this.closeButton.shapeOffset.y = 8
        this.panelContainer.addChild(this.closeButton.container)
        this.panelContainer.view.visible = false;

        this.closeButton.onClick.add(() => {
            this.onHidePanel.dispatch();
        })

        this.header = new Header(this.closeButton);
        this.panelContainer.addChild(this.header)



    }
    setPanelColor(color: number) {
        this.panel.tint = 0xFFFFFF//color;
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
    showSection(gameData: GameData) {
        this.currentSection = gameData;
        this.header.setTitle(this.currentSection.title, this.currentSection.mainColor)
        this.content.setTexture(PIXI.Texture.from(gameData.mainThumb))
        //this.cloneMesh.setTexture(PIXI.Texture.from(gameData.mainThumb))
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

            // this.x = this.snapMesh.x
            // this.cloneMesh.x = this.snapMesh.x + ScreenInfo.gameWidth / 2
            // this.cloneMesh.z = this.snapMesh.z + ScreenInfo.gameHeight / 2
            // this.cloneMesh.worldMesh.verticiesBuffer = this.snapMesh.worldMesh.getCurrentVertices().data as number[]
            // this.z = this.snapMesh.z

            // this.cloneMesh.worldMesh.alpha = MathUtils.lerp(this.cloneMesh.worldMesh.alpha, 1, 0.01)
        } else {
            // this.cloneMesh.x = -5000
            //this.cloneMesh.worldMesh.alpha = 0
        }


        if (this.loggie.overlay.isPortrait) {

            this.panel.width = Math.max(512 * 1.2, ScreenInfo.gameWidth * 0.9)
            this.panel.height = Math.max(720, ScreenInfo.gameHeight * 0.7)

            this.panel.x = -this.panel.width / 2
            this.panel.y = -this.panel.height / 2
        } else {
            this.panel.width = Math.max(512 * 1.2, ScreenInfo.gameWidth * 0.6)
            this.panel.height = Math.max(0, this.loggie.overlay.down * 0.6)

            this.panel.x = -this.panel.width / 2 + this.panel.width * 0.2//+ ScreenInfo.gameWidth / 2//(ScreenInfo.gameWidth - this.panel.width)
            this.panel.y = -this.panel.height / 2 - this.panel.height * 0.2

        }



        this.panelShadow.width = this.panel.width * 1.1
        this.panelShadow.height = this.panel.height * 1.1

        this.panelShadow.x = this.panel.x - this.panelShadow.width * 0.05
        this.panelShadow.y = -this.panelShadow.height / 2

        this.footer.x = this.panel.x
        this.footer.y = this.panel.height / 2
        this.footer.resize(this.panel.width, 150)


        this.content.x = this.panel.x
        this.content.y = -this.panel.height / 2 + 100
        this.content.resize(this.panel.width, this.panel.height - 100)


        if (this.header) {

            this.header.x = this.panel.x
            this.header.y =this.panel.y
            this.header.resize(this.panel.width, 100)
        }
    }
}