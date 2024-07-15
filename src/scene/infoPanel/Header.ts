import ViewUtils from 'loggie/utils/ViewUtils';
import * as PIXI from 'pixi.js';
import BitmapTextButton from '../BitmapTextButton';
export default class Header extends PIXI.Container {
    private title: PIXI.BitmapText;
    private backShape: PIXI.Sprite;
    public closeButton!: BitmapTextButton;

    constructor(closeButton: BitmapTextButton) {
        super()

        this.backShape = new PIXI.Sprite(PIXI.Texture.WHITE)
        this.addChild(this.backShape)
        this.backShape.alpha = 0xffffff

        this.title = new PIXI.BitmapText('GAME TITLE', { fontName: 'Poppins-Black', fontSize: 64 });
        this.addChild(this.title)
        this.title.tint = 0x66A7FF

        this.closeButton = closeButton;
        this.addChild(this.closeButton.container)

    }
    setTitle(title: string, color: number = 0x66A7FF) {
        this.title.text = title;
        this.title.tint = color
    }
    updateShapeColor(value: number = 0xFFFFFF, alpha: number = 1) {
        this.backShape.tint = value;
        this.backShape.alpha = alpha;
    }
    resize(width: number, height: number) {
        this.backShape.width = width
        this.backShape.height = height

        this.closeButton.container.x = width - 80

        this.title.scale.set(Math.min(1, ViewUtils.elementScaler(this.title, width - 150)))

        this.title.x = 30
        this.title.y = 8



    }

}