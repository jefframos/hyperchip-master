import * as PIXI from 'pixi.js';

import gsap, { Back } from 'gsap';

import LoggieApplication from 'loggie/LoggieApplication';
import Camera from 'loggie/core/camera/Camera';
import GameObject from 'loggie/core/gameObject/GameObject';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import ScreenInfo from 'loggie/core/screen/ScreenInfo';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import MathUtils from 'loggie/utils/MathUtils';
import { Signal } from 'signals';
import BitmapTextButton from '../BitmapTextButton';
import { GameData } from '../HyperchipGame';
import MainTiledMesh from '../MainTiledMesh';
import Footer from './Footer';
import GameContent from './GameContent';
import Header from './Header';

export default class GameInfoPanel extends GameObject {
    public panelContainer!: GameViewContainer;
    public snapMesh!: MainTiledMesh;
    public cloneMesh!: MainTiledMesh;
    public gameTexture: PIXI.Sprite = new PIXI.Sprite();
    public panelShadow!: PIXI.NineSlicePlane;
    public panel!: PIXI.NineSlicePlane;
    public closeButton!: BitmapTextButton;
    public currentSection!: GameData | undefined;
    public footer: Footer = new Footer();
    public header!: Header;
    public content: GameContent = new GameContent();
    public onHidePanel: Signal = new Signal();

    constructor() {
        super()
    }
    build() {
        super.build();

        this.panelContainer = this.poolComponent(GameViewContainer, true, RenderLayers.UILayerOverlay)

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
        this.panelContainer.addChild(this.footer)

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
        this.content.hide();
        this.currentSection = undefined;
    }
    showSection(gameData: GameData) {
        this.currentSection = gameData;

        this.footer.setData(gameData)
        this.footer.setLogo(PIXI.Texture.from(gameData.mainThumb))
        this.header.setTitle(this.currentSection.title, this.currentSection.mainColor)
        this.content.setTexture(PIXI.Texture.from(gameData.mainThumb), gameData.contentImage)
        this.content.setContentText(this.currentSection.contentText)

        gsap.killTweensOf(this.panelContainer.view)
        gsap.killTweensOf(this.panelContainer.view.scale)
        this.panelContainer.view.visible = true;
        this.panelContainer.view.alpha = 0
        gsap.to(this.panelContainer.view, { duration: 0.25, alpha: 1, delay: 0.085 })
        gsap.to(this.panelContainer.view.scale, { duration: 0.8, x: 1.5, y: 1.5, delay: 0.5, ease: Back.easeOut })
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        this.content.update(delta)
        this.panelContainer.view.scale.set(Camera.Zoom)
        if (this.snapMesh) {
            this.x = MathUtils.lerp(this.x, this.snapMesh.x + ScreenInfo.gameWidth / 2, 0.2)
            this.z = MathUtils.lerp(this.z, this.snapMesh.z + ScreenInfo.gameHeight / 2, 0.2)

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


        if (!this.currentSection) {
            return;
        }
        if (this.loggie.overlay.isPortrait) {

            this.content.setTitle(this.currentSection.title, this.currentSection.mainColor)
            this.header.setTitle('', this.currentSection.mainColor)

            if (PIXI.isMobile.any || LoggieApplication.debugParams.forceMobile) {
                this.panel.width = Math.max(512 * 1.2, ScreenInfo.gameWidth * 0.9)
                this.panel.height = Math.max(720, ScreenInfo.gameHeight * 0.65)
                this.panel.x = -this.panel.width / 2
                this.panel.y = -this.panel.height / 2 - ScreenInfo.gameHeight * 0.075
            } else {
                this.panel.width = Math.max(512 * 1.2, ScreenInfo.gameWidth * 0.9)
                this.panel.height = Math.max(512, ScreenInfo.gameHeight * 0.6)
                this.panel.x = -this.panel.width / 2
                this.panel.y = -this.panel.height / 2 - 100
            }


        } else {
            // this.content.setTitle('', this.currentSection.mainColor)
            // this.header.setTitle(this.currentSection.title, this.currentSection.mainColor)

            this.content.setTitle(this.currentSection.title, this.currentSection.mainColor)
            this.header.setTitle('', this.currentSection.mainColor)

            this.panel.width = Math.max(512 * 1.2, ScreenInfo.gameWidth * 0.6)
            this.panel.x = -this.panel.width / 2 + this.panel.width * 0.2//+ ScreenInfo.gameWidth / 2//(ScreenInfo.gameWidth - this.panel.width)

            if (PIXI.isMobile.any || LoggieApplication.debugParams.forceMobile) {
                this.panel.height = Math.max(0, this.loggie.overlay.down * 0.5)
                this.panel.y = -this.panel.height / 2 - this.panel.height * 0.2
            } else {

                this.panel.height = Math.max(0, this.loggie.overlay.down * 0.6)
                this.panel.y = -this.panel.height / 2 - this.panel.height * 0.2
            }

        }



        this.panelShadow.width = this.panel.width * 1.1
        this.panelShadow.height = this.panel.height * 1.1

        this.panelShadow.x = this.panel.x - this.panelShadow.width * 0.05
        this.panelShadow.y = -this.panelShadow.height / 2



        this.content.x = this.panel.x
        this.content.y = this.panel.y//-this.panel.height / 2 //- 150
        this.content.resize(this.panel.width, this.panel.height + 150)

        this.footer.x = this.panel.x
        this.footer.y = this.content.y + this.panel.height + 150
        this.footer.resize(this.panel.width, 150)

        if (this.header) {

            this.header.x = this.panel.x
            this.header.y = this.panel.y - 150
            this.header.resize(this.panel.width, 100)
            if (this.loggie.overlay.isPortrait) {
                this.header.updateShapeColor(0x181a21)
                this.closeButton.container.y = 0
                this.header.y = this.panel.y - 100
            } else {
                this.header.updateShapeColor(0xFFFFFF, 0)
                this.closeButton.container.x += 50
                this.closeButton.container.y = 120
            }
        }
    }
}