import * as PIXI from 'pixi.js';

import StateMachine, { State } from './StateMachine';

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
    private whiteOuter!: GameViewSprite;
    private whiteIntro!: GameViewSprite;
    private flatBackground!: GameViewSprite;
    private gameInfoPanel!: GameInfoPanel;
    private meshGrid!: MeshGrid;
    private targetBackgroundAlpha: number = 0.35
    private buttonsTargetPosition: number = 0

    private mapCenter!: GameObject;
    private debug!: GameObject;
    private text: PIXI.Text = new PIXI.Text();;
    private debugContainer!: GameViewContainer
    private gameButtonsGo!: GameObject
    private gameButtonsContainer!: GameViewContainer
    private mainMenuContainer!: GameViewContainer
    private buttonsList: Map<string, number> = new Map()

    private perspCamera!: PerspectiveCamera;
    private menuCollapsed: boolean = true;
    private activeButton!: BitmapTextButton;
    private aboutButton!: BitmapTextButton;
    private gamesButton!: BitmapTextButton;


    private gradient1: ColorStop[] = []
    private gradient2: ColorStop[] = []
    private gradientFlat: ColorStop[] = []


    private stateMachine!: StateMachine;
    private fovEasing: EaseFunction = Ease.easeInOutBack

    private gameDataMap: Map<string, GameData> = new Map();



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
    }
    build() {
        super.build();

        //const ropes = this.poolGameObject(TopRopes, true);
        this.flatBackground = GameViewUtils.makeSprite(this, PIXI.Texture.WHITE, RenderLayers.BaseB).findComponent<GameViewSprite>(GameViewSprite)
        this.flatBackground.ignoreCameraPerspective = true;
        this.flatBackground.ignoreCameraScale = true;
        this.flatBackground.view.anchor.set(0.5)


        this.whiteIntro = GameViewUtils.makeSprite(this, PIXI.Texture.from('white-top-1'), RenderLayers.FrontLayer).findComponent<GameViewSprite>(GameViewSprite)
        this.whiteIntro.ignoreCameraPerspective = true;
        this.whiteIntro.ignoreCameraScale = true;
        this.whiteIntro.ignoreCameraScroll = true;
        this.whiteIntro.view.anchor.set(0.5)

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

        this.logo = GameViewUtils.makeSprite(this, PIXI.Texture.from('logo'), RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.logo.customZIndex = 100

        InteractiveEventUtils.addClickTap(this.logo.view, () => {
            if (this.stateMachine.currentState == (State.Standard)) {
                this.menuCollapsed = !this.menuCollapsed
            } else if (this.stateMachine.currentState == (State.SectionOpen)) {
                this.stateMachine.setState(State.Standard)
                this.closeCurrentSection()
            }
        })


        const containerGo = GameViewUtils.makeContainer(this, RenderLayers.UILayerOverlay)
        this.mainMenuContainer = containerGo.findComponent<GameViewContainer>(GameViewContainer)
        this.aboutButton = this.poolComponent(BitmapTextButton, true, '     ABOUT', 0xFFFFFF, 0xF45BED, 0x209cff) as BitmapTextButton
        this.aboutButton.setDefaultPanelColor(0x209cff)
        this.aboutButton.container.scale.set(1.1)

        this.mainMenuContainer.view.addChild(this.aboutButton.container)
        this.aboutButton.onClick.add(() => {
            // if (this.stateMachine.currentState == (State.Standard)) {
            //     this.menuCollapsed = !this.menuCollapsed
            // }
        })

        this.gamesButton = this.poolComponent(BitmapTextButton, true, '     GAMES', 0xFFFFFF) as BitmapTextButton
        this.gamesButton.setDefaultPanelColor(0xF45BED)
        this.gamesButton.container.scale.set(1.1)


        this.mainMenuContainer.view.addChild(this.gamesButton.container)
        this.gamesButton.container.y = 100
        this.gamesButton.onClick.add(() => {
            if (this.stateMachine.currentState == (State.Standard)) {
                this.menuCollapsed = !this.menuCollapsed
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
                    gameButton.container.y = this.buttonsList.size * 100
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
                });
            }
        }
        setTimeout(() => {
            if (LoggieApplication.debugParams.redirect) {
                const targetMesh = this.meshGrid.moveToId(gameDataList.games[0].id);
                if (targetMesh) {
                    this.stateMachine.setState(State.SectionOpen)
                    this.gameInfoPanel.snapToMesh(targetMesh)
                    this.gameInfoPanel.showSection(gameDataList.games[0])
                }
            }
        }, 100);
        this.meshGrid = this.poolGameObject(MeshGrid, true, this.gameDataMap)

        this.debug = this.poolGameObject(GameObject, true);
        const container = this.debug.poolComponent(GameViewContainer, true, RenderLayers.UILayerOverlay)
        container.addChild(this.text)
        this.text.text = ''
        this.debug.x = 300
        this.mapCenter = this.poolGameObject(GameObject, true);
        this.gameInfoPanel = this.poolGameObject(GameInfoPanel, true);
        this.gameInfoPanel.onHidePanel.add(() => {
            if (this.stateMachine.currentState == (State.SectionOpen)) {
                this.stateMachine.setState(State.Standard)
                this.closeCurrentSection()
            }
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
        this.stateMachine.setState(State.Standard)
        this.closeCurrentSection()
        await PromiseUtils.await(750)
        this.openSection(section)
    }
    openSection(section: GameData) {
        const targetMesh = this.meshGrid.moveToId(section.id);
        if (targetMesh) {
            this.stateMachine.setState(State.SectionOpen)
            this.gameInfoPanel.snapToMesh(targetMesh)
            this.gameInfoPanel.showSection(section)
        }
    }
    closeCurrentSection() {
        this.activeButton?.setActive(false)
        this.gameInfoPanel.hideSection()
        this.menuCollapsed = false;
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);


        if (this.logo) {
            if (PIXI.isMobile.any) {
                if (this.loggie.overlay.isPortrait) {
                    //this.logo.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.right * 0.3, this.loggie.overlay.right * 0.3)))
                } else {
                    //this.logo.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.down * 0.3, this.loggie.overlay.down * 0.3)))

                }
            } else {
                if (this.loggie.overlay.isPortrait) {
                    //this.logo.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.down * 0.2, this.loggie.overlay.down * 0.2)))
                } else {
                    //this.logo.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.down * 0.2, this.loggie.overlay.down * 0.2)))
                }
            }
        }

        if (!this.stateMachine) {
            return
        }

        this.mapCenter.y = MathUtils.lerp(this.mapCenter.y, 0, 0.1)
        this.perspCamera.setFollowPoint(this.mapCenter.transform.position)


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




        if (this.stateMachine.currentState == State.Standard) {
            this.targetBackgroundAlpha = MathUtils.lerp(this.targetBackgroundAlpha, 0.35, 0.1)
            this.buttonsTargetPosition = 40
            this.mainMenuContainer.gameObject.x = 15
        } else if (this.stateMachine.currentState == State.SectionOpen) {
            this.targetBackgroundAlpha = MathUtils.lerp(this.targetBackgroundAlpha, 0.65, 0.1)
            if (this.loggie.overlay.isPortrait) {
                this.mainMenuContainer.gameObject.x = -500
                this.buttonsTargetPosition = -this.gameButtonsContainer.view.width - 50
                this.leftVignette.view.alpha = MathUtils.lerp(this.leftVignette.view.alpha, 0, 0.1)

            } else {
                this.leftVignette.view.alpha = MathUtils.lerp(this.leftVignette.view.alpha, 1, 0.1)
                this.mainMenuContainer.gameObject.x = 15
                this.buttonsTargetPosition = 40
            }
        }
        if (this.menuCollapsed) {
            this.buttonsTargetPosition = -this.gameButtonsContainer.view.width - 50
        }

        this.gamesButton.setActive(!this.menuCollapsed)

        this.gameButtonsGo.x = MathUtils.lerp(this.gameButtonsGo.x, this.buttonsTargetPosition, 0.2)


        this.mainMenuContainer.gameObject.z = this.logo.gameObject.z + this.logo.view.height - 20

        this.logo.gameObject.x = 20
        // this.logo.gameObject.x = this.loggie.overlay.right /2 - this.logo.view.width /2
        this.logo.gameObject.z = 20

        if (this.loggie.overlay.isPortrait) {
            if (PIXI.isMobile.any) {

                this.logo.gameObject.x = this.loggie.overlay.right - this.logo.view.width - 20
                this.logo.gameObject.z = 30
                this.mainMenuContainer.gameObject.z = this.logo.gameObject.z + this.logo.view.height / 2 - 60
            }
            this.gameButtonsContainer.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.gameButtonsContainer.view, this.loggie.overlay.right * 0.9, this.loggie.overlay.down * 0.5)))
        } else {
            if (PIXI.isMobile.any) {
                this.logo.gameObject.x = this.loggie.overlay.right - this.logo.view.width - 20
                this.logo.gameObject.z = 30
                this.mainMenuContainer.gameObject.z = this.logo.gameObject.z + this.logo.view.height / 2 - 60
            }
            this.gameButtonsContainer.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.gameButtonsContainer.view, this.loggie.overlay.right * 0.3, this.loggie.overlay.down * 0.55)))
        }


        this.gameButtonsGo.z = this.mainMenuContainer.gameObject.z + 210

        this.gameInfoPanel.setPanelColor(ColorUtils.interpolateGradient(this.gradient2, Math.cos(Loggie.Time * 0.5) * 0.5 + 0.5))
        if (this.flatBackground) {
            this.flatBackground.view.width = this.perspCamera.cameraViewBounds.width
            this.flatBackground.view.height = this.perspCamera.cameraViewBounds.height
            this.flatBackground.gameObject.x = this.perspCamera.cameraViewBounds.center.x
            this.flatBackground.gameObject.z = this.perspCamera.cameraViewBounds.center.y
            this.flatBackground.view.tint = ColorUtils.interpolateGradient(this.gradientFlat, Math.cos(Loggie.Time * 0.5) * 0.5 + 0.5)

        }
        if (this.whiteIntro) {
            this.whiteIntro.view.width = this.perspCamera.cameraViewBounds.width//this.loggie.overlay.right / (1 - Camera.Zoom)
            this.whiteIntro.view.height = this.perspCamera.cameraViewBounds.height
            this.whiteIntro.view.alpha = this.targetBackgroundAlpha
            this.whiteIntro.gameObject.x = this.perspCamera.cameraViewBounds.center.x
            this.whiteIntro.gameObject.z = this.perspCamera.cameraViewBounds.center.y
            this.whiteIntro.view.tint = ColorUtils.interpolateGradient(this.gradient1, Math.sin(Loggie.Time * 0.5) * 0.5 + 0.5)
        }


        if (this.topVignette) {
            this.topVignette.view.width = this.perspCamera.cameraViewBounds.width
            this.topVignette.gameObject.x = this.perspCamera.cameraViewBounds.x
            this.topVignette.gameObject.z = this.perspCamera.cameraViewBounds.y
            //this.topVignette.view.tint = ColorUtils.interpolateGradient(this.gradient2, Math.sin(Loggie.Time * 0.5) * 0.5 + 0.5)
        }

        if (this.whiteOuter) {
            this.whiteOuter.view.width = this.perspCamera.cameraViewBounds.width
            this.whiteOuter.view.height = this.perspCamera.cameraViewBounds.height
            this.whiteOuter.view.alpha = this.targetBackgroundAlpha
            this.whiteOuter.gameObject.x = this.perspCamera.cameraViewBounds.center.x
            this.whiteOuter.gameObject.z = this.perspCamera.cameraViewBounds.center.y
            this.whiteOuter.view.tint = ColorUtils.interpolateGradient(this.gradient2, Math.sin(Loggie.Time * 0.5) * 0.5 + 0.5)
        }
    }
}