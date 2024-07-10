import BaseComponent from 'loggie/core/gameObject/BaseComponent';
import InteractiveEventUtils from 'loggie/utils/InteractiveEventUtils';
import MathUtils from 'loggie/utils/MathUtils';
import * as PIXI from 'pixi.js';
import { Signal } from 'signals';
export default class BitmapTextButton extends BaseComponent {
    public container!: PIXI.Container;
    private maskedContainer!: PIXI.Container;
    private bitmapText!: PIXI.BitmapText;
    private bitmapMaskedText!: PIXI.BitmapText;
    private backShape: PIXI.Sprite = PIXI.Sprite.from(PIXI.Texture.WHITE)
    private maskShape: PIXI.Sprite = PIXI.Sprite.from(PIXI.Texture.WHITE)
    private mouseOver: boolean = false
    public shapeOffset: PIXI.Point = new PIXI.Point()
    public onClick: Signal = new Signal()
    build(text: string = 'X', primaryColor: number = 0xff0152, secondaryColor: number = 0x209cff) {
        super.build()

        this.container = new PIXI.Container()
        this.container.interactive = true;
        this.container.cursor = 'pointer';


        this.container.addChild(this.backShape)

        this.bitmapText = new PIXI.BitmapText(text, { fontName: 'Poppins-Black', fontSize: 72 });
        this.container.addChild(this.bitmapText)
        this.bitmapText.tint = primaryColor
        this.backShape.height = this.bitmapText.height + 10

        this.mouseOver = false

        this.maskedContainer = new PIXI.Container()
        this.container.addChild(this.maskedContainer)

        this.bitmapMaskedText = new PIXI.BitmapText(text, { fontName: 'Poppins-Black', fontSize: 72 });
        this.maskedContainer.addChild(this.bitmapMaskedText)
        this.bitmapMaskedText.tint = secondaryColor

        this.maskedContainer.addChild(this.maskShape)
        this.maskedContainer.mask = this.maskShape

        InteractiveEventUtils.removeEvents(this.container)
        InteractiveEventUtils.addPointerOver(this.container, () => {
            this.mouseOver = true
        })
        InteractiveEventUtils.addPointerOut(this.container, () => {
            this.mouseOver = false
        })
        InteractiveEventUtils.addClickTap(this.container, () => {
            this.onClick.dispatch(this.GUID);
        })
        this.shapeOffset.x = -15
        this.shapeOffset.y = 15
    }

    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        if (this.mouseOver) {
            this.backShape.width = MathUtils.lerp(this.backShape.width, this.bitmapText.width + 20, 0.1)
        } else {
            this.backShape.width = Math.floor(MathUtils.lerp(this.backShape.width, 0, 0.1))

        }

        this.bitmapMaskedText.x = this.bitmapText.x
        this.bitmapMaskedText.y = this.bitmapText.y
        this.bitmapMaskedText.text = this.bitmapText.text

        this.backShape.x = this.shapeOffset.x
        this.backShape.y = this.shapeOffset.y

        this.maskShape.x = this.backShape.x
        this.maskShape.y = this.backShape.y

        this.maskShape.width = this.backShape.width
        this.maskShape.height = this.backShape.height
    }

}