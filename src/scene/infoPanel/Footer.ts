import * as PIXI from 'pixi.js';

import { GameData } from '../HyperchipGame';
import InteractiveEventUtils from 'loggie/utils/InteractiveEventUtils';
import ViewUtils from 'loggie/utils/ViewUtils';

export default class Footer extends PIXI.Container {
    private pixiLogo: PIXI.Sprite;
    private playLogo: PIXI.Sprite;
    private backShape: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE)
    private gameLogo: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE)
    private madeWithText: PIXI.BitmapText;
    private currentGameData!: GameData;
    constructor() {
        super()

        this.addChild(this.backShape)
        this.backShape.tint = 0x181a21
        this.madeWithText = new PIXI.BitmapText('Made with ', { fontName: 'Poppins-Light', fontSize: 24 });
        this.addChild(this.madeWithText)
        this.addChild(this.gameLogo)

        this.gameLogo.cursor = 'pointer'

        InteractiveEventUtils.addClickTap(this.gameLogo, () => {
            this.redirectToGame();
        })

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

        gtag('event', 'redirect_game', {
            'event_category': 'button',
            'event_label': this.currentGameData.id
          });
    }
    setLogo(texture: PIXI.Texture) {
        this.gameLogo.texture = texture;
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
        this.gameLogo.scale.set(ViewUtils.elementScaler(this.gameLogo, 1000, height - 20))
        this.gameLogo.x = 10
        this.gameLogo.y = 10

        this.playLogo.x = width - 30
        this.playLogo.y = height / 2

        this.playLogo.scale.set(ViewUtils.elementScaler(this.playLogo, 1000, height * 0.5))

        this.pixiLogo.scale.set(ViewUtils.elementScaler(this.pixiLogo, 1000, height * 0.35))

        this.madeWithText.x = Math.min(width / 2 - this.pixiLogo.width / 2, this.playLogo.x - this.playLogo.width - this.pixiLogo.width - 20) //Math.min(width / 2, this.playLogo.x - this.playLogo.width + 20)
        this.madeWithText.y = height / 2 - 60

        this.pixiLogo.x = this.madeWithText.x
        this.pixiLogo.y = height / 2 + 20


    }

}