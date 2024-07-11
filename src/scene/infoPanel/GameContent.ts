import ViewUtils from 'loggie/utils/ViewUtils';
import * as PIXI from 'pixi.js';
export default class GameContent extends PIXI.Container {
    private gameThumb: PIXI.Sprite;
    private backShape: PIXI.Sprite;
    private madeWithText: PIXI.BitmapText;
    constructor() {
        super()

        this.backShape = new PIXI.Sprite(PIXI.Texture.WHITE)
        this.addChild(this.backShape)
        this.madeWithText = new PIXI.BitmapText('Made with ', { fontName: 'Poppins-Light', fontSize: 24 });
        this.addChild(this.madeWithText)
        this.madeWithText.tint = 0x181a21
        this.gameThumb = PIXI.Sprite.from('pixijs-logo-transparent-dark')
        this.addChild(this.gameThumb)
        this.gameThumb.anchor.set(0, 0)


        this.resize(800, 150)
    }
    setTexture(texture: PIXI.Texture) {
        this.gameThumb.texture = texture
    }
    resize(width: number, height: number) {
        this.backShape.width = width
        this.backShape.height = height


        this.gameThumb.x = 80
        this.gameThumb.y = 80

        this.gameThumb.scale.set(ViewUtils.elementScaler(this.gameThumb, 1000, height * 0.35))

        this.madeWithText.x = this.gameThumb.x
        this.madeWithText.y = this.gameThumb.y + this.gameThumb.height + 20

    }

}