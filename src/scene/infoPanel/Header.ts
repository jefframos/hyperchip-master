import * as PIXI from 'pixi.js';
export default class Header extends PIXI.Container {
    private title: PIXI.BitmapText;
    private backShape: PIXI.Sprite;

    constructor() {
        super()

        this.backShape = new PIXI.Sprite(PIXI.Texture.WHITE)
        this.addChild(this.backShape)
        this.backShape.tint = 0x181a21

        this.title = new PIXI.BitmapText('GAME TITLE', { fontName: 'Poppins-Black', fontSize: 72 });
        this.addChild(this.title)
    }
    setTitle(title: string) {
        this.title.text = title;
    }
    resize(width: number, height: number) {
        this.backShape.width = width
        this.backShape.height = height

        this.title.x = 40
        this.title.y = this.backShape.height / 2 - this.title.height / 2 - 10


    }

}