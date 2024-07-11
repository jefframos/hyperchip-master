import ViewUtils from 'loggie/utils/ViewUtils';
import * as PIXI from 'pixi.js';
export default class Footer extends PIXI.Container {
    private pixiLogo: PIXI.Sprite;
    private playLogo: PIXI.Sprite;
    private backShape: PIXI.Sprite;
    private madeWithText: PIXI.BitmapText;
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

        this.playLogo = PIXI.Sprite.from('poki-badge_light')
        this.addChild(this.playLogo)
        this.playLogo.anchor.set(1, 0.5)

        this.resize(800, 150)
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