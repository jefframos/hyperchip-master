import BaseComponent from 'loggie/core/gameObject/BaseComponent';
import InteractiveEventUtils from 'loggie/utils/InteractiveEventUtils';
import MathUtils from 'loggie/utils/MathUtils';
import ViewUtils from 'loggie/utils/ViewUtils';
import * as PIXI from 'pixi.js';
import { Signal } from 'signals';
export default class BitmapTextButton extends BaseComponent {
    public container!: PIXI.Container;
    private maskedContainer!: PIXI.Container;
    private bitmapText!: PIXI.BitmapText;
    private bitmapText2!: PIXI.BitmapText;
    private bitmapMaskedText!: PIXI.BitmapText;
    private shadow: PIXI.NineSlicePlane = new PIXI.NineSlicePlane(PIXI.Texture.from('small-shadow'), 64, 64, 64, 64)
    private hiddenShape: PIXI.Sprite = PIXI.Sprite.from(PIXI.Texture.WHITE)
    private backShape: PIXI.Sprite = PIXI.Sprite.from(PIXI.Texture.WHITE)
    private maskShape: PIXI.Sprite = PIXI.Sprite.from(PIXI.Texture.WHITE)
    private icon!: PIXI.Sprite
    private mouseOver: boolean = false
    private isActive: boolean = false
    public shapeOffset: PIXI.Point = new PIXI.Point()
    public onClick: Signal = new Signal()
    private primaryColor: number = 0xE72264
    private secondaryColor: number = 0x209cff
    private activeColor: number = 0xF45BED
    build(text: string = 'X', primaryColor: number = 0xE72264, secondaryColor: number = 0x209cff, activeColor: number = 0xF45BED) {
        super.build()

        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.activeColor = activeColor;

        this.container = new PIXI.Container()
        this.container.interactive = true;
        this.container.cursor = 'pointer';

        this.shadow.alpha = .35
        this.shadow.tint = 0
        this.container.addChild(this.hiddenShape)
        this.container.addChild(this.backShape)

        this.hiddenShape.alpha = 0

        this.bitmapText2 = new PIXI.BitmapText(text, { fontName: 'Poppins-Black', fontSize: 72 });
        this.container.addChild(this.bitmapText2)
        this.bitmapText2.tint = 0
        this.bitmapText2.alpha = 0.25

        this.bitmapText = new PIXI.BitmapText(text, { fontName: 'Poppins-Black', fontSize: 72 });
        this.container.addChild(this.bitmapText)
        this.bitmapText.tint = this.primaryColor


        this.backShape.height = 80

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

        this.backShape.width = 0
    }
    addIcon(texture: PIXI.Texture) {
        this.icon = new PIXI.Sprite(texture)
        this.container.addChild(this.icon)
        this.icon.anchor.y = 0.5
        this.icon.scale.set(ViewUtils.elementScaler(this.icon, this.backShape.height - 30))
        this.icon.y = this.backShape.height / 2 + 15

        this.icon.x = this.bitmapText.width - this.icon.width
    }
    iconOnRight() {

        this.icon.x = 0
    }
    iconOnLeft() {
        this.icon.x = this.bitmapText.width - this.icon.width

    }
    updateText(text: string) {
        this.bitmapText.text = text
        this.bitmapText2.text = text
    }
    addShadow() {
        this.container.addChildAt(this.shadow, 0)
    }
    setDefaultPanelColor(color: number) {
        this.hiddenShape.tint = color
        this.hiddenShape.alpha = 1
    }
    setTransitionPanelColor(color: number) {
        this.backShape.tint = color
    }
    setActive(value: boolean) {
        this.isActive = value;
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);


        this.hiddenShape.width = this.bitmapText.width + 20
        this.hiddenShape.height = this.backShape.height

        this.bitmapText2.x = this.bitmapText.x + 5
        this.bitmapText2.y = this.bitmapText.y + 5

        this.shadow.width = this.hiddenShape.width + 20
        this.shadow.height = this.hiddenShape.height + 20

        if (this.mouseOver || this.isActive) {
            this.backShape.width = MathUtils.lerp(this.backShape.width, this.bitmapText.width + 20, 0.1)
        } else {
            this.backShape.width = Math.floor(MathUtils.lerp(this.backShape.width, 0, 0.1))
        }

        this.bitmapMaskedText.tint = this.isActive ? this.activeColor : this.secondaryColor

        this.bitmapMaskedText.x = this.bitmapText.x
        this.bitmapMaskedText.y = this.bitmapText.y
        this.bitmapMaskedText.text = this.bitmapText.text

        this.backShape.x = this.shapeOffset.x
        this.backShape.y = this.shapeOffset.y

        this.shadow.x = this.backShape.x
        this.shadow.y = this.backShape.y

        this.maskShape.x = this.backShape.x
        this.maskShape.y = this.backShape.y

        this.hiddenShape.x = this.backShape.x
        this.hiddenShape.y = this.backShape.y

        this.maskShape.width = this.backShape.width
        this.maskShape.height = this.backShape.height
    }

}