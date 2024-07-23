import * as PIXI from 'pixi.js';

import StateMachine, { State } from './StateMachine';

import gsap from 'gsap';
import LoggieApplication from 'loggie/LoggieApplication';
import Loggie from 'loggie/core/Loggie';
import PerspectiveCamera from 'loggie/core/camera/PerspectiveCamera';
import GameObject from 'loggie/core/gameObject/GameObject';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import GameViewSprite from 'loggie/core/view/GameViewSprite';
import GameViewUtils from 'loggie/core/view/GameViewUtils';
import InteractiveEventUtils from 'loggie/utils/InteractiveEventUtils';
import MathUtils from 'loggie/utils/MathUtils';
import ViewUtils from 'loggie/utils/ViewUtils';
import { ColorStop } from 'loggie/utils/color/ColorStop';
import ColorUtils from 'loggie/utils/color/ColorUtils';
import PromiseUtils from 'loggie/utils/promise/PromiseUtils';
import Ease from 'loggie/utils/tween2/Ease';
import { EaseFunction } from 'loggie/utils/tween2/Tweener';
import BitmapTextButton from './BitmapTextButton';
import MeshGrid from './MeshGrid';
import AboutPanel from './infoPanel/AboutPanel';
import GameInfoPanel from './infoPanel/GameInfoPanel';

export interface GameData {
    id: string;
    name: string;
    mainThumb: string;
    mainColor: number;
    secondaryColor: number;
    title: string;
    contentText: string;
    contentImage: string[];
    video: string;
    playLink: string;
    publisher: string;
    madeWith: string;
}
interface GameDataList {
    games: GameData[];
}
export default class HyperchipGame extends GameObject {
    private logo!: GameViewSprite;
    private topVignette!: GameViewSprite;
    private leftVignette!: GameViewSprite;
    private eclipse!: GameViewSprite;
    private whiteOuter!: GameViewSprite;
    private whiteIntro!: GameViewSprite;
    private flatBackground!: GameViewSprite;
    private gameInfoPanel!: GameInfoPanel;
    private aboutPanel!: AboutPanel;
    private meshGrid!: MeshGrid;
    private targetBackgroundAlpha: number = 0.35
    private buttonsTargetPosition: number = 0

    private mapCenter!: GameObject;
    private debug!: GameObject;
    private text: PIXI.Text = new PIXI.Text();
    private debugContainer!: GameViewContainer
    private spaceTexture!: PIXI.TilingSprite;
    private spaceTexture2!: PIXI.TilingSprite;
    private spaceContainer!: GameViewContainer
    private buttons: PIXI.Container[] = []
    private maxButtonSize: number = -1;
    private gameButtonsGo!: GameObject
    private gameButtonsContainer!: GameViewContainer
    private mainMenuContainer!: GameViewContainer
    private buttonsList: Map<string, number> = new Map()

    private perspCamera!: PerspectiveCamera;
    private menuCollapsed: boolean = true;
    private aboutActive: boolean = false;
    private activeButton!: BitmapTextButton;
    private aboutButton!: BitmapTextButton;
    private gamesButton!: BitmapTextButton;


    private gradient1: ColorStop[] = []
    private gradient2: ColorStop[] = []
    private gradient3: ColorStop[] = []
    private gradientFlat: ColorStop[] = []


    private stateMachine!: StateMachine;
    private fovEasing: EaseFunction = Ease.easeInOutBack

    private gameDataMap: Map<string, GameData> = new Map();
    private menuDirection: number = 1


    constructor() {
        super()
        this.gradientFlat.push(
            {
                color: 0x5d0ba9,
                position: 0
            },
            {
                color: 0x403eb8,
                position: 1
            }
        )

        this.gradient1.push(
            {
                color: 0xfd5392,
                position: 0
            },
            {
                color: 0x68e0cf,
                position: 1
            }
        )
        this.gradient2.push(
            {
                color: 0xf86f64,
                position: 0
            },
            {
                color: 0x209cff,
                position: 1
            }
        )

        this.gradient3.push(
            {
                color: 0x5d0ba9,
                position: 0
            },
            {
                color: 0x68e0cf,
                position: 1
            }
        )
    }
    build() {
        super.build();

        this.spaceContainer = GameViewUtils.makeContainer(this, RenderLayers.Base).findComponent<GameViewContainer>(GameViewContainer)
        this.spaceContainer.ignoreCameraPerspective = true;
        this.spaceContainer.ignoreCameraScale = true;

        this.spaceTexture = new PIXI.TilingSprite(PIXI.Texture.from('seamless-starfield-texture.jpg'))
        this.spaceContainer.addChild(this.spaceTexture)
        this.spaceTexture.anchor.set(0.5)
        this.spaceTexture.tileScale.set(2)
        this.spaceTexture.width = 15000
        this.spaceTexture.height = 15000

        // this.spaceTexture2 = new PIXI.TilingSprite(PIXI.Texture.from('stars.png'))
        // this.spaceContainer.addChild(this.spaceTexture2)
        // this.spaceTexture2.anchor.set(0.5)
        // this.spaceTexture2.tileScale.set(1.5)
        // this.spaceTexture2.width = 15000
        // this.spaceTexture2.height = 15000

        //const ropes = this.poolGameObject(TopRopes, true);


        this.flatBackground = GameViewUtils.makeSprite(this, PIXI.Texture.WHITE, RenderLayers.BaseB).findComponent<GameViewSprite>(GameViewSprite)
        this.flatBackground.ignoreCameraPerspective = true;
        this.flatBackground.ignoreCameraScale = true;
        this.flatBackground.view.anchor.set(0.5)

        this.eclipse = GameViewUtils.makeSprite(this, PIXI.Texture.from('eclipse'), RenderLayers.Base).findComponent<GameViewSprite>(GameViewSprite)
        this.eclipse.ignoreCameraPerspective = true;
        this.eclipse.ignoreCameraScale = true;
        this.eclipse.view.scale.set(ViewUtils.elementScaler(this.eclipse.view, 1280))
        this.eclipse.view.anchor.set(0.5)

        this.whiteIntro = GameViewUtils.makeSprite(this, PIXI.Texture.from('white-top-1'), RenderLayers.FrontLayer).findComponent<GameViewSprite>(GameViewSprite)
        this.whiteIntro.ignoreCameraPerspective = true;
        this.whiteIntro.ignoreCameraScale = true;
        this.whiteIntro.ignoreCameraScroll = true;
        this.whiteIntro.view.anchor.set(0.5)
        this.whiteIntro.view.alpha = 0.5

        this.whiteOuter = GameViewUtils.makeSprite(this, PIXI.Texture.from('white-top-2'), RenderLayers.FrontLayer).findComponent<GameViewSprite>(GameViewSprite)
        this.whiteOuter.ignoreCameraPerspective = true;
        this.whiteOuter.ignoreCameraScale = true;
        this.whiteOuter.ignoreCameraScroll = true;
        this.whiteOuter.view.anchor.set(0.5)

        this.topVignette = GameViewUtils.makeSprite(this, PIXI.Texture.from('top-glow'), RenderLayers.FrontLayer).findComponent<GameViewSprite>(GameViewSprite)
        this.topVignette.ignoreCameraPerspective = true;
        this.topVignette.ignoreCameraScale = true;
        this.topVignette.ignoreCameraScroll = true;
        this.topVignette.customZIndex = -100

        this.leftVignette = GameViewUtils.makeSprite(this, PIXI.Texture.from('left-vignette'), RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.leftVignette.customZIndex = -100

        this.logo = GameViewUtils.makeSprite(this, PIXI.Texture.from('logo3'), RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.logo.customZIndex = 100

        InteractiveEventUtils.addClickTap(this.logo.view, () => {
            this.closeAbout()
            if (this.stateMachine.currentState == (State.Standard)) {
                this.menuCollapsed = !this.menuCollapsed
            } else if (this.stateMachine.currentState == (State.SectionOpen)) {
                this.toStandardState()
                this.closeCurrentSection()
            }
        })


        const containerGo = GameViewUtils.makeContainer(this, RenderLayers.UILayerOverlay)
        this.mainMenuContainer = containerGo.findComponent<GameViewContainer>(GameViewContainer)
        this.aboutButton = this.poolComponent(BitmapTextButton, true, '      ABOUT       ', 0xFFFFFF, 0xF45BED, 0x209cff) as BitmapTextButton
        this.aboutButton.setDefaultPanelColor(0x209cff)
        this.aboutButton.container.scale.set(1.1)
        this.aboutButton.addShadow()
        this.aboutButton.addIcon(PIXI.Texture.from('plus'))

        this.mainMenuContainer.view.addChild(this.aboutButton.container)
        this.aboutButton.onClick.add(() => {
            // this.aboutActive = !this.aboutActive
            this.menuCollapsed = true
            this.handleAbout();
        })

        this.gamesButton = this.poolComponent(BitmapTextButton, true, '      GAMES       ', 0xFFFFFF) as BitmapTextButton
        this.gamesButton.setDefaultPanelColor(0xF45BED)
        this.gamesButton.container.scale.set(1.1)
        this.gamesButton.addShadow()
        this.gamesButton.addIcon(PIXI.Texture.from('burguer'))

        this.mainMenuContainer.view.addChild(this.gamesButton.container)
        this.gamesButton.container.y = 100
        this.gamesButton.onClick.add(() => {

            this.closeAbout()
            this.toStandardState()
            if (this.stateMachine.currentState == (State.Standard)) {
                this.menuCollapsed = !this.menuCollapsed
            } else {
            }

        })



        this.gameButtonsGo = GameViewUtils.makeContainer(this, RenderLayers.UILayerOverlay)
        this.gameButtonsContainer = this.gameButtonsGo.findComponent<GameViewContainer>(GameViewContainer)
        this.gameButtonsGo.x = -520
        const gameDataList = PIXI.Cache.get('gameData.json')
        if (gameDataList) {
            if (gameDataList.games) {
                gameDataList.games.forEach((element: GameData) => {
                    this.gameDataMap.set(element.id, element);

                    const gameButton = this.poolComponent(BitmapTextButton, true, element.name.toUpperCase(), 0xFFFFFF, 0x209cff, element.mainColor) as BitmapTextButton
                    this.gameButtonsContainer.addChild(gameButton.container)
                    this.buttons.push(gameButton.container);
                    gameButton.container.y = this.buttonsList.size * 100
                    gameButton.setDefaultPanelColor(0x24252F)
                    gameButton.onClick.add(() => {
                        if (this.stateMachine.currentState == State.Standard) {
                            this.openSection(element)
                        } else {
                            this.closeAndOpen(element)
                        }
                        this.activeButton?.setActive(false)
                        this.activeButton = gameButton
                        this.activeButton?.setActive(true)
                    })
                    this.buttonsList.set(element.id, gameButton.GUID);

                    if (gameButton.container.width > this.maxButtonSize) {
                        this.maxButtonSize = gameButton.container.width
                    }
                });
            }
        }
        setTimeout(() => {
            if (LoggieApplication.debugParams.redirect) {
                const targetMesh = this.meshGrid.moveToId(gameDataList.games[0].id);
                if (targetMesh) {
                    this.toOpenState();
                    this.gameInfoPanel.snapToMesh(targetMesh)
                    this.gameInfoPanel.showSection(gameDataList.games[0])
                }
            }
            if (LoggieApplication.debugParams.about) {
                this.showAbout();
            }
        }, 100);
        this.meshGrid = this.poolGameObject(MeshGrid, true, this.gameDataMap)

        this.meshGrid.onTileSelected.add((tileId: string) => {
            if (this.stateMachine.currentState == (State.Standard)) {
                const targetMesh = this.meshGrid.moveToId(tileId);
                if (targetMesh) {
                    this.toOpenState();
                    this.menuCollapsed = false
                    this.gameInfoPanel.snapToMesh(targetMesh)
                    this.gameInfoPanel.showSection(this.gameDataMap.get(tileId))
                }
            }
        })

        this.mainMenuContainer.view.alpha = 0
        this.logo.view.alpha = 0
        this.gameButtonsContainer.view.alpha = 0
        gsap.to([this.mainMenuContainer.view, this.logo.view, this.gameButtonsContainer.view], { alpha: 1, duration: 0.5, delay: 1.5 })

        this.debug = this.poolGameObject(GameObject, true);
        const container = this.debug.poolComponent(GameViewContainer, true, RenderLayers.UILayerOverlay)
        container.addChild(this.text)
        this.text.text = ''
        this.debug.x = 300
        this.mapCenter = this.poolGameObject(GameObject, true);


        this.gameInfoPanel = this.poolGameObject(GameInfoPanel, true);
        this.gameInfoPanel.onHidePanel.add(() => {
            if (this.stateMachine.currentState == (State.SectionOpen)) {
                this.toStandardState()
                this.closeCurrentSection()
            }
        })

        this.aboutPanel = this.poolGameObject(AboutPanel, true);
        this.aboutPanel.onHidePanel.add(() => {
            this.closeAbout()
            this.toStandardState()
        })

        this.mapCenter = this.poolGameObject(GameObject, true);
        this.mapCenter.y = 1500
        if (this.loggie.mainCamera instanceof PerspectiveCamera) {
            this.perspCamera = this.loggie.mainCamera as PerspectiveCamera;
            this.perspCamera.forceZoom(0.5)
            this.perspCamera.zoomLerp = 0.1
            this.perspCamera.setFollowPoint(this.mapCenter.transform.position)
            this.perspCamera.snapFollowPoint()

        }

        const statesConfig = {
            [State.Standard]: { timelineNormal: 0 },
            [State.SectionOpen]: { timelineNormal: 0.5 },
        };
        this.stateMachine = this.poolComponent(StateMachine, true, State.Standard, 3, statesConfig)

    }
    async closeAndOpen(section: GameData) {
        this.toStandardState()
        this.closeCurrentSection()
        await PromiseUtils.await(750)
        this.openSection(section)
    }
    closeAbout() {
        this.aboutPanel.hideSection()
        this.aboutActive = false;
    }
    showAbout() {
        this.toOpenState();
        this.aboutPanel.showSection()
        this.aboutActive = true;
    }
    handleAbout() {
        if (this.stateMachine.currentState == (State.SectionOpen)) {
            this.toStandardState()
            this.closeCurrentSection()
        }
        if (this.aboutActive) {
            this.closeAbout();
            this.toStandardState()

        } else {
            this.showAbout();
        }

    }
    toOpenState() {
        this.eclipse.view.alpha = 0
        this.stateMachine.setState(State.SectionOpen)
    }
    toStandardState() {
        this.stateMachine.setState(State.Standard)
        gsap.killTweensOf(this.eclipse.view.scale)
        this.eclipse.view.alpha = 1
        this.eclipse.view.scale.set(ViewUtils.elementScaler(this.eclipse.view, 1280))
        gsap.from(this.eclipse.view.scale, { x: 0, y: 0, duration: 1.2, delay: 0.5 })
    }
    openSection(section: GameData) {
        const targetMesh = this.meshGrid.moveToId(section.id);
        if (targetMesh) {
            this.closeAbout()
            this.toOpenState();
            this.gameInfoPanel.snapToMesh(targetMesh)
            this.gameInfoPanel.showSection(section)

        }
    }
    closeCurrentSection() {
        this.activeButton?.setActive(false)
        this.gameInfoPanel.hideSection()
        //this.menuCollapsed = false;
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        if (PIXI.isMobile.any && this.loggie.overlay.isPortrait) {
            this.buttons.forEach(element => {
                element.x = this.maxButtonSize - element.width
            });
            this.menuDirection = -1
        } else {
            this.buttons.forEach(element => {
                element.x = 0
            });
            this.menuDirection = 1
        }

        if (this.logo) {
            if (PIXI.isMobile.any) {

                if (this.loggie.overlay.isPortrait) {
                    this.logo.view.texture = PIXI.Texture.from('logo3')
                    this.logo.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.right * 0.35, this.loggie.overlay.right * 0.35)))
                } else {
                    this.logo.view.texture = PIXI.Texture.from('logo')
                    this.logo.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, 400)))

                }
            } else {
                this.logo.view.texture = PIXI.Texture.from('logo2')
                this.logo.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, 300)))
            }
        }

        if (!this.stateMachine) {
            return
        }




        this.meshGrid.locked = this.stateMachine.currentState != State.Standard

        if (this.perspCamera) {
            this.perspCamera.cameraAttributes.fov = this.fovEasing(130, -130, this.stateMachine.timelineNormal * 2);
            this.perspCamera.setZoom(1)
        }

        if (this.topVignette) {
            this.topVignette.view.width = this.loggie.overlay.right
        }
        if (this.leftVignette) {
            this.leftVignette.gameObject.z = -10
            this.leftVignette.view.height = this.loggie.overlay.down + 20
        }

        this.logo.view.visible = true;

        if (this.stateMachine.currentState == State.Standard) {
            this.mapCenter.y = MathUtils.lerp(this.mapCenter.y, 290, 0.1)
            this.targetBackgroundAlpha = MathUtils.lerp(this.targetBackgroundAlpha, 0.35, 0.1)
            if (this.loggie.overlay.isPortrait) {
                if (PIXI.isMobile.any) {
                    this.mainMenuContainer.gameObject.x = this.loggie.overlay.right - 420
                    this.buttonsTargetPosition = this.loggie.overlay.right - this.maxButtonSize - 10
                } else {

                    this.buttonsTargetPosition = 40
                    this.mainMenuContainer.gameObject.x = 15
                }
            } else {
                this.buttonsTargetPosition = 40
                this.mainMenuContainer.gameObject.x = 15
            }
        } else if (this.stateMachine.currentState == State.SectionOpen) {
            this.mapCenter.y = MathUtils.lerp(this.mapCenter.y, 0, 0.1)
            this.targetBackgroundAlpha = MathUtils.lerp(this.targetBackgroundAlpha, 0.55, 0.1)
            if (this.loggie.overlay.isPortrait) {
                if (PIXI.isMobile.any) {
                    this.mainMenuContainer.gameObject.x = this.loggie.overlay.right + 50
                    this.buttonsTargetPosition = this.loggie.overlay.right + this.gameButtonsContainer.view.width
                } else {
                    this.mainMenuContainer.gameObject.x = -500
                    this.buttonsTargetPosition = -this.gameButtonsContainer.view.width - 50
                }
                this.logo.view.visible = false;
                this.leftVignette.view.alpha = MathUtils.lerp(this.leftVignette.view.alpha, 0, 0.1)

            } else {
                this.leftVignette.view.alpha = MathUtils.lerp(this.leftVignette.view.alpha, 1, 0.1)
                this.mainMenuContainer.gameObject.x = 15
                this.buttonsTargetPosition = 40
            }
        }

        this.perspCamera.setFollowPoint(this.mapCenter.transform.position)

        this.eclipse.gameObject.transform.position.copy(this.mapCenter.transform.position)

        console.log(this.menuCollapsed)
        if (this.menuCollapsed) {
            if (PIXI.isMobile.any && this.loggie.overlay.isPortrait) {
                this.buttonsTargetPosition = this.loggie.overlay.right + 50
            } else {
                this.buttonsTargetPosition = -this.gameButtonsContainer.view.width - 50
            }
        }
        if (PIXI.isMobile.any) {
            this.mainMenuContainer.gameObject.z = this.logo.gameObject.z + this.logo.view.height
        } else {
            this.mainMenuContainer.gameObject.z = this.logo.gameObject.z + this.logo.view.height - 20
        }

        this.gamesButton.setActive(!this.menuCollapsed)

        //console.log(this.aboutActive)
        this.aboutButton.setActive(this.aboutActive)

        this.gameButtonsGo.x = MathUtils.lerp(this.gameButtonsGo.x, this.buttonsTargetPosition, 0.2)




        // this.logo.gameObject.x = this.loggie.overlay.right /2 - this.logo.view.width /2
        this.logo.gameObject.z = 20

        this.aboutButton.iconOnLeft()
        this.gamesButton.iconOnLeft()

        if (this.loggie.overlay.isPortrait) {
            if (PIXI.isMobile.any) {

                this.aboutButton.iconOnRight()
                this.gamesButton.iconOnRight()
                this.logo.gameObject.x = MathUtils.lerp(this.logo.gameObject.x, this.loggie.overlay.right / 2 - this.logo.view.width / 2, 0.1)
                this.logo.gameObject.z = 30
                this.mainMenuContainer.gameObject.z = this.logo.gameObject.z + this.logo.view.height

            } else {
                this.logo.gameObject.x = MathUtils.lerp(this.logo.gameObject.x, 20, 0.1)
            }
            this.gameButtonsContainer.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.gameButtonsContainer.view, this.loggie.overlay.right * 0.9, this.loggie.overlay.down * 0.5)))
        } else {
            if (PIXI.isMobile.any) {
                this.logo.gameObject.x = 20
                this.logo.gameObject.z = 40
                this.mainMenuContainer.gameObject.z = this.logo.gameObject.z + this.logo.view.height
            }
            this.gameButtonsContainer.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.gameButtonsContainer.view, this.loggie.overlay.right * 0.3, this.loggie.overlay.down * 0.5)))
        }


        this.gameButtonsGo.z = this.mainMenuContainer.gameObject.z + 210

        this.gameInfoPanel.setPanelColor(ColorUtils.interpolateGradient(this.gradient2, Math.cos(Loggie.Time * 0.5) * 0.5 + 0.5))
        if (this.flatBackground) {
            this.flatBackground.view.width = this.perspCamera.cameraViewBounds.width + 2
            this.flatBackground.view.height = this.perspCamera.cameraViewBounds.height + 2
            this.flatBackground.gameObject.x = this.perspCamera.cameraViewBounds.center.x
            this.flatBackground.gameObject.z = this.perspCamera.cameraViewBounds.center.y
            this.flatBackground.view.tint = ColorUtils.interpolateGradient(this.gradientFlat, Math.cos(Loggie.Time * 0.5) * 0.5 + 0.5)

        }
        if (this.whiteIntro) {
            this.whiteIntro.view.width = this.perspCamera.cameraViewBounds.width + 2//this.loggie.overlay.right / (1 - Camera.Zoom)
            this.whiteIntro.view.height = this.perspCamera.cameraViewBounds.height + 2
            this.whiteIntro.view.alpha = this.targetBackgroundAlpha * 0.5
            this.whiteIntro.gameObject.x = this.perspCamera.cameraViewBounds.center.x
            this.whiteIntro.gameObject.z = this.perspCamera.cameraViewBounds.center.y
            this.whiteIntro.view.tint = ColorUtils.interpolateGradient(this.gradient1, Math.sin(Loggie.Time * 0.5) * 0.5 + 0.5)
        }


        if (this.topVignette) {
            this.topVignette.view.width = this.perspCamera.cameraViewBounds.width + 2
            this.topVignette.gameObject.x = this.perspCamera.cameraViewBounds.x
            this.topVignette.gameObject.z = this.perspCamera.cameraViewBounds.y
            //this.topVignette.view.tint = ColorUtils.interpolateGradient(this.gradient2, Math.sin(Loggie.Time * 0.5) * 0.5 + 0.5)
        }

        if (this.whiteOuter) {
            this.whiteOuter.view.width = this.perspCamera.cameraViewBounds.width + 2
            this.whiteOuter.view.height = this.perspCamera.cameraViewBounds.height + 2
            this.whiteOuter.view.alpha = this.targetBackgroundAlpha
            this.whiteOuter.gameObject.x = this.perspCamera.cameraViewBounds.center.x
            this.whiteOuter.gameObject.z = this.perspCamera.cameraViewBounds.center.y
            this.whiteOuter.view.tint = ColorUtils.interpolateGradient(this.gradient2, Math.sin(Loggie.Time * 0.5) * 0.5 + 0.5)
        }
        if (this.eclipse) {
            this.eclipse.view.tint = ColorUtils.interpolateGradient(this.gradient3, Math.sin(Loggie.Time * 0.5) * 0.5 + 0.5)
        }
        if (this.spaceTexture) {
            this.spaceTexture.tilePosition.y += delta * 64;
            this.spaceTexture.tilePosition.y %= 256 * 2;
            this.spaceTexture.rotation += delta * 0.05
            this.spaceTexture.rotation %= Math.PI * 2;
            this.spaceTexture.scale.set(Math.cos(Loggie.Time) * 0.1 + 0.99, Math.sin(Loggie.Time) * 0.05 + 0.995);
        }
        if (this.spaceTexture2) {
            // this.spaceTexture2.tint = ColorUtils.interpolateGradient(this.gradient2, Math.sin(Loggie.Time * 0.5) * 0.5 + 0.5)
            this.spaceTexture2.tilePosition.y += delta * 24;
            this.spaceTexture2.tilePosition.y %= 256;
        }
    }
}