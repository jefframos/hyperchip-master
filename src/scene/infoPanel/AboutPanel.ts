import * as PIXI from 'pixi.js';

import gsap, { Back } from 'gsap';

import LoggieApplication from 'loggie/LoggieApplication';
import Camera from 'loggie/core/camera/Camera';
import GameObject from 'loggie/core/gameObject/GameObject';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import ScreenInfo from 'loggie/core/screen/ScreenInfo';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import { Signal } from 'signals';
import BitmapTextButton from '../BitmapTextButton';
import { GameData } from '../HyperchipGame';
import PeopleCard from './PeopleCard';

export interface PeopleData {
    id: string;
    name: string;
    portrait: string;
    description: string;
    mainColor: number;
    secondaryColor: number;
    role: string;
    portfolio: string;
    linkedin: string;
}

export default class AboutPanel extends GameObject {
    public panelContainer!: GameViewContainer;
    public gameTexture: PIXI.Sprite = new PIXI.Sprite();
    public panelShadow!: PIXI.NineSlicePlane;
    public panel!: PIXI.NineSlicePlane;
    public closeButton!: BitmapTextButton;
    public currentSection!: GameData | undefined;
    public onHidePanel: Signal = new Signal();

    private peopleData: Map<string, PeopleData> = new Map();
    private peopleCards: PeopleCard[] = [];
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
        this.panel.tint = 0xFFFFFF;

        // this.cloneMesh = this.poolGameObject(MainTiledMesh, true, 'Layer 1') as MainTiledMesh
        // this.cloneMesh.worldMesh.layer = RenderLayers.UILayerOverlay

        this.panelContainer.addChild(this.panel)

        this.gameTexture.texture = PIXI.Texture.EMPTY
        this.gameTexture.anchor.set(0.5)
        this.panelContainer.addChild(this.gameTexture)



        this.closeButton = this.poolComponent(BitmapTextButton, true, 'X', 0xFFFFFF, 0xE72264)
        this.closeButton.setDefaultPanelColor(0xE72264)
        this.closeButton.shapeOffset.y = 8
        this.panelContainer.addChild(this.closeButton.container)
        this.panelContainer.view.visible = false;

        this.closeButton.onClick.add(() => {
            this.onHidePanel.dispatch();
        })


        if (PIXI.Assets.get('about-data.json')) {
            PIXI.Assets.get('about-data.json').people.forEach((element: PeopleData) => {
                this.peopleData.set(element.name, element)
                const ppCard = new PeopleCard(element)
                this.panelContainer.view.addChild(ppCard)
                this.peopleCards.push(ppCard)
            });
        }


    }

    hideSection() {
        gsap.killTweensOf(this.panelContainer.view)
        gsap.killTweensOf(this.panelContainer.view.scale)
        gsap.to(this.panelContainer.view, {
            duration: 0.5, alpha: 0, onComplete: () => {
                this.panelContainer.view.visible = false;
            }
        })
        this.currentSection = undefined;
    }
    showSection() {

        gsap.killTweensOf(this.panelContainer.view)
        gsap.killTweensOf(this.panelContainer.view.scale)
        this.panelContainer.view.visible = true;
        this.panelContainer.view.alpha = 0
        gsap.to(this.panelContainer.view, { duration: 0.25, alpha: 1, delay: 0.85 })
        gsap.to(this.panelContainer.view.scale, { duration: 0.8, x: 1.5, y: 1.5, delay: 0.5, ease: Back.easeOut })
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        this.panelContainer.view.scale.set(Camera.Zoom)


        this.x = ScreenInfo.gameWidth / 2
        this.z = ScreenInfo.gameHeight / 2

        if (this.loggie.overlay.isPortrait) {


            if (PIXI.isMobile.any || LoggieApplication.debugParams.forceMobile) {
                this.panel.width = Math.max(512 * 1.2, ScreenInfo.gameWidth * 0.9)
                this.panel.height = Math.max(800, ScreenInfo.gameHeight * 0.8)
                this.panel.x = -this.panel.width / 2
                this.panel.y = -this.panel.height / 2 + 100
            } else {
                this.panel.width = Math.max(512 * 1.2, ScreenInfo.gameWidth * 0.9)
                this.panel.height = Math.max(800, ScreenInfo.gameHeight * 0.6)
                this.panel.x = -this.panel.width / 2
                this.panel.y = -this.panel.height / 2
            }



        } else {
            this.panel.width = Math.max(512 * 1.2, ScreenInfo.gameWidth * 0.6)
            this.panel.x = -this.panel.width / 2 + this.panel.width * 0.2//+ ScreenInfo.gameWidth / 2//(ScreenInfo.gameWidth - this.panel.width)

            if (PIXI.isMobile.any || LoggieApplication.debugParams.forceMobile) {
                this.panel.height = Math.max(0, this.loggie.overlay.down * 0.8)
                this.panel.y = -this.panel.height / 2// - this.panel.height * 0.2
            } else {

                this.panel.height = Math.max(0, this.loggie.overlay.down * 0.7)
                this.panel.y = -this.panel.height / 2 //- this.panel.height * 0.2
            }


        }

        for (let index = 0; index < this.peopleCards.length; index++) {
            const element = this.peopleCards[index];
            if (this.panel.width < this.panel.height) {
                element.x = this.panel.x;
                element.y = this.panel.y + index * this.panel.height / 2;
            } else {

                element.x = this.panel.x + index * this.panel.width / 2;
                element.y = this.panel.y;
            }

            element.resize(this.panel.width, this.panel.height)

        }

        this.panelShadow.width = this.panel.width * 1.1
        this.panelShadow.height = this.panel.height * 1.1

        this.panelShadow.x = this.panel.x - this.panelShadow.width * 0.05
        this.panelShadow.y = this.panel.y //- this.panelShadow.height / 2

        this.closeButton.container.x = this.panel.x + this.panel.width - 80
        this.closeButton.container.y = this.panel.y //- this.panel.height / 2

    }
}