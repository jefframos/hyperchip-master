import * as PIXI from 'pixi.js';

import LoggieApplication from 'loggie/LoggieApplication';
import Loggie from 'loggie/core/Loggie';
import PerspectiveCamera from 'loggie/core/camera/PerspectiveCamera';
import GameObject from 'loggie/core/gameObject/GameObject';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import GameViewSprite from 'loggie/core/view/GameViewSprite';
import GameViewUtils from 'loggie/core/view/GameViewUtils';
import MathUtils from 'loggie/utils/MathUtils';
import ViewUtils from 'loggie/utils/ViewUtils';
import { ColorStop } from 'loggie/utils/color/ColorStop';
import ColorUtils from 'loggie/utils/color/ColorUtils';
import Ease from 'loggie/utils/tween2/Ease';
import { EaseFunction } from 'loggie/utils/tween2/Tweener';
import BitmapTextButton from './BitmapTextButton';
import MeshGrid from './MeshGrid';
import StateMachine, { State } from './StateMachine';
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
    private buttonsList: Map<string, number> = new Map()
    private cameraOffset: PIXI.Point = new PIXI.Point(0, 0);
    private worldVelocity: PIXI.Point = new PIXI.Point(0, 0);

    private perspCamera!: PerspectiveCamera;
    private worldCollapsed: boolean = false;


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
        this.whiteIntro.view.anchor.set(0.5)

        this.whiteOuter = GameViewUtils.makeSprite(this, PIXI.Texture.from('white-top-2'), RenderLayers.FrontLayer).findComponent<GameViewSprite>(GameViewSprite)
        this.whiteOuter.ignoreCameraPerspective = true;
        this.whiteOuter.ignoreCameraScale = true;
        this.whiteOuter.view.anchor.set(0.5)

        this.topVignette = GameViewUtils.makeSprite(this, PIXI.Texture.from('top-glow'), RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.topVignette.customZIndex = -100

        this.leftVignette = GameViewUtils.makeSprite(this, PIXI.Texture.from('left-vignette'), RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.leftVignette.customZIndex = -100

        this.logo = GameViewUtils.makeSprite(this, PIXI.Texture.from('logo'), RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.logo.customZIndex = 100

        this.gameButtonsGo = GameViewUtils.makeContainer(this, RenderLayers.UILayerOverlay)
        this.gameButtonsContainer = this.gameButtonsGo.findComponent<GameViewContainer>(GameViewContainer)
        this.gameButtonsGo.x = 20
        const gameDataList = PIXI.Cache.get('gameData.json')
        if (gameDataList) {
            if (gameDataList.games) {
                gameDataList.games.forEach((element: GameData) => {
                    this.gameDataMap.set(element.id, element);

                    const gameButton = this.poolComponent(BitmapTextButton, true, element.name.toUpperCase(), 0xFFFFFF) as BitmapTextButton
                    this.gameButtonsContainer.addChild(gameButton.container)
                    gameButton.container.y = this.buttonsList.size * 100
                    gameButton.onClick.add(() => {
                        if (this.stateMachine.currentState == State.Standard) {
                            const targetMesh = this.meshGrid.moveToId(element.id);
                            if (targetMesh) {
                                this.stateMachine.setState(State.SectionOpen)
                                this.gameInfoPanel.snapToMesh(targetMesh)
                                this.gameInfoPanel.showSection(element)
                            }
                        }
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
                this.gameInfoPanel.hideSection()
            }
        })
        //this.mapCenter.poolComponent(GameViewGraphics, true).view.beginFill(0xFF0000).drawCircle(0, 0, 10)   

        // this.logo.view.interactive = true;
        // this.logo.view.cursor = 'pointer'
        // this.logo.view.onpointerup = (e) => {
        //     this.worldCollapsed = !this.worldCollapsed;

        //     if (this.stateMachine.currentState == (State.SectionOpen)) {
        //         this.stateMachine.setState(State.Standard)
        //         this.gameInfoPanel.hideSection()
        //     } else {
        //         const targetMesh = this.meshGrid.moveToId(Math.ceil(Math.random() * 6));
        //         if (targetMesh) {
        //             this.stateMachine.setState(State.SectionOpen)
        //             this.gameInfoPanel.snapToMesh(targetMesh)
        //             this.gameInfoPanel.showSection()
        //         }
        //     }
        // }

        if (this.loggie.mainCamera instanceof PerspectiveCamera) {
            this.perspCamera = this.loggie.mainCamera as PerspectiveCamera;
        }

        const statesConfig = {
            [State.Standard]: { timelineNormal: 0 },
            [State.SectionOpen]: { timelineNormal: 0.5 },
        };
        this.stateMachine = this.poolComponent(StateMachine, true, State.Standard, 3, statesConfig)


    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        if (this.logo) {
            if (PIXI.isMobile.any) {
                this.logo.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.right * 0.4, this.loggie.overlay.right * 0.4)))
            } else {
                if (this.loggie.overlay.isPortrait) {
                    this.logo.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.down * 0.2, this.loggie.overlay.down * 0.2)))
                } else {
                    this.logo.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.right * 0.2, this.loggie.overlay.down * 0.2)))
                }
            }
        }


        this.meshGrid.locked = this.stateMachine.currentState != State.Standard

        if (this.perspCamera) {
            this.perspCamera.cameraAttributes.fov = this.fovEasing(130, -130, this.stateMachine.timelineNormal * 2)//this.springPov.getPosition();
        }

        if (this.topVignette) {
            this.topVignette.view.width = this.loggie.overlay.right
        }
        if (this.leftVignette) {
            this.leftVignette.view.height = this.loggie.overlay.down
        }


        if (this.flatBackground) {
            this.flatBackground.view.width = this.loggie.overlay.right
            this.flatBackground.view.height = this.loggie.overlay.down

            this.flatBackground.view.tint = ColorUtils.interpolateGradient(this.gradientFlat, Math.cos(Loggie.Time * 0.5) * 0.5 + 0.5)

        }

        if (this.stateMachine.currentState == State.Standard) {
            this.targetBackgroundAlpha = MathUtils.lerp(this.targetBackgroundAlpha, 0.35, 0.1)
            this.buttonsTargetPosition = 20
        } else if (this.stateMachine.currentState == State.SectionOpen) {
            this.targetBackgroundAlpha = MathUtils.lerp(this.targetBackgroundAlpha, 0.65, 0.1)
            this.buttonsTargetPosition = -this.gameButtonsContainer.view.width - 50

        }
        this.gameButtonsGo.x = MathUtils.lerp(this.gameButtonsGo.x, this.buttonsTargetPosition, 0.2)
        this.leftVignette.gameObject.x = MathUtils.lerp(this.leftVignette.gameObject.x, this.buttonsTargetPosition - 20, 0.2)

        this.gameButtonsContainer.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.gameButtonsContainer.view, this.loggie.overlay.right * 0.9, this.loggie.overlay.right * 0.9)))
        this.gameButtonsGo.z = this.loggie.overlay.down - this.gameButtonsContainer.view.height - 20

        this.gameInfoPanel.setPanelColor(ColorUtils.interpolateGradient(this.gradient2, Math.cos(Loggie.Time * 0.5) * 0.5 + 0.5))
        if (this.whiteIntro) {
            this.whiteIntro.view.width = this.loggie.overlay.right
            this.whiteIntro.view.height = this.loggie.overlay.down
            this.whiteIntro.view.alpha = this.targetBackgroundAlpha

            this.whiteIntro.view.tint = ColorUtils.interpolateGradient(this.gradient1, Math.sin(Loggie.Time * 0.5) * 0.5 + 0.5)
        }
        if (this.whiteOuter) {
            this.whiteOuter.view.width = this.loggie.overlay.right
            this.whiteOuter.view.height = this.loggie.overlay.down
            this.whiteOuter.view.alpha = this.targetBackgroundAlpha
            this.whiteOuter.view.tint = ColorUtils.interpolateGradient(this.gradient2, Math.sin(Loggie.Time * 0.5) * 0.5 + 0.5)
        }
    }
}