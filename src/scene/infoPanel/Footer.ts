import InteractiveEventUtils from 'loggie/utils/InteractiveEventUtils';
import ViewUtils from 'loggie/utils/ViewUtils';
import * as PIXI from 'pixi.js';
import { GameData } from '../HyperchipGame';
export default class Footer extends PIXI.Container {
    private pixiLogo: PIXI.Sprite;
    private playLogo: PIXI.Sprite;
    private backShape: PIXI.Sprite;
    private madeWithText: PIXI.BitmapText;
    private currentGameData!: GameData;
    constructor() {
        super()

        this.backShape = new PIXI.Sprite(PIXI.Texture.WHITE)
        this.addChild(this.backShape)
        this.backShape.tint = 0x181a21
        this.madeWithText = new PIXI.BitmapText('Made with ', { fontName: 'Poppins-Light', fontSize: 24 });
        this.addChild(this.madeWithText)

        this.pixiLogo = PIXI.Sprite.from('pixijs-logo-transparent-dark')
        this.addChild(this.pixiLogo)
        this.pixiLogo.anchor.set(0, 0.5)

        this.pixiLogo.cursor = 'pointer'
        InteractiveEventUtils.addClickTap(this.pixiLogo, () => {
            window.open('https://pixijs.com/', '_blank');
        })

        this.playLogo = PIXI.Sprite.from('poki-badge_light')
        this.addChild(this.playLogo)
        this.playLogo.anchor.set(1, 0.5)


        this.playLogo.cursor = 'pointer'

        InteractiveEventUtils.addClickTap(this.playLogo, () => {
            this.redirectToGame();
        })

        this.resize(800, 150)
    }
    redirectToGame() {
        window.open(this.currentGameData.playLink, '_blank');
    }
    setData(gameData: GameData) {
        this.currentGameData = gameData;

        if (gameData.publisher == 'POKI') {
            this.playLogo.texture = PIXI.Texture.from('poki-badge_light')
        } else if (gameData.publisher == 'GITHUB') {
            this.playLogo.texture = PIXI.Texture.from('play-git-hub')
        }
        // this.playLogo.width = 500
        // this.playLogo.height = 500


    }
    resize(width: number, height: number) {
        this.backShape.width = width
        this.backShape.height = height

        this.madeWithText.x = 40
        this.madeWithText.y = this.backShape.height / 2 - this.madeWithText.height / 2

        this.pixiLogo.x = this.madeWithText.x + this.madeWithText.width + 10
        this.pixiLogo.y = height / 2

        this.pixiLogo.scale.set(ViewUtils.elementScaler(this.pixiLogo, 1000, height * 0.35))


        this.playLogo.x = width - 30
        this.playLogo.y = height / 2

        this.playLogo.scale.set(ViewUtils.elementScaler(this.playLogo, 1000, height * 0.5))

    }

}