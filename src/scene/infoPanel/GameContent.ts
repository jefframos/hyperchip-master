import * as PIXI from 'pixi.js';

import CycleTextureChangerAsync from './CycleTextureChangerAsync';
import DataUtils from 'loggie/utils/DataUtils';
import MathUtils from 'loggie/utils/MathUtils';
import ScreenInfo from 'loggie/core/screen/ScreenInfo';
import ViewUtils from 'loggie/utils/ViewUtils';

export default class GameContent extends PIXI.Container {
    private gameThumb: PIXI.Sprite;
    private textureChanger: CycleTextureChangerAsync = new CycleTextureChangerAsync(3, 0.5);
    private video!: PIXI.Sprite;
    private videoElement!: HTMLVideoElement;
    private thumbMask: PIXI.Sprite = PIXI.Sprite.from(PIXI.Texture.WHITE)
    private backShape: PIXI.Sprite;
    private maskedContainer: PIXI.Container = new PIXI.Container();
    private contentText: PIXI.Text;
    private title!: PIXI.BitmapText;

    constructor() {
        super()

        this.backShape = new PIXI.Sprite(PIXI.Texture.WHITE)
        this.addChild(this.backShape)
        this.backShape.tint = 0xffffff

        this.addChild(this.maskedContainer)
        this.thumbMask.tint = 0xff0000

        this.addChild(this.thumbMask)
        this.maskedContainer.mask = this.thumbMask
        this.contentText = new PIXI.Text('Made with ', { fontFamily: 'Poppins-Regular', fontSize: 24 });
        this.addChild(this.contentText)
        this.contentText.tint = 0x181a21
        this.contentText.resolution = 1
        this.gameThumb = PIXI.Sprite.from('pixijs-logo-transparent-dark')
        this.maskedContainer.addChild(this.gameThumb)
        this.maskedContainer.addChild(this.textureChanger)
        this.gameThumb.anchor.set(0, 0)

        this.title = new PIXI.BitmapText('', { fontName: 'Poppins-Black', fontSize: 72 });
        this.addChild(this.title)
        if (PIXI.isMobile.any) {
            //this.madeWithText.style.fontSize = 80
        }
        this.contentText.style.wordWrap = true;
        this.resize(800, 150)
    }
    async loadVideo(url: string): Promise<void> {

        if (this.video) {
            this.video.alpha = 0;

        }
        return new Promise((resolve, reject) => {
            PIXI.Assets.load(url).then((resources) => {

                if (this.video) {
                    this.maskedContainer.removeChild(this.video);
                }
                const videoTexture = PIXI.Texture.from(url);
                this.video = new PIXI.Sprite(videoTexture);
                this.video.anchor.set(0);
                this.video.alpha = 0

                this.videoElement = this.video.texture.baseTexture.resource.source as HTMLVideoElement;
                this.videoElement.loop = true;
                this.maskedContainer.addChild(this.video);

                resolve();

                this.playVideo()

            }).catch((error) => {
                console.error('Error loading video:', error);
                reject(new Error('Failed to load video'));
            });
        });
    }
    playVideo() {
        if (this.video) {
            this.videoElement.play();
        }
    }

    pauseVideo() {
        if (this.video) {
            this.videoElement.pause();
        }
    }
    setTexture(thumb: PIXI.Texture, textures: string[]) {
        this.gameThumb.texture = thumb
        this.textureChanger.setTextureURLs(DataUtils.shuffleArray(textures))
        //this.textureChanger.setTextures(texture)
    }
    setTitle(value: string, color: number) {
        this.title.text = value;
        this.title.tint = color;
    }
    setContentText(value: string) {
        this.contentText.text = value;
    }
    update(delta: number) {
        this.textureChanger.update(delta);
    }
    hide() {
        this.textureChanger.hide()
    }
    resize(width: number, height: number) {
        this.backShape.width = width
        this.backShape.height = height


        if (ScreenInfo.gameWidth < ScreenInfo.gameHeight) {

            this.title.x = width / 2 - this.title.width / 2
            this.title.y = height * 0.4
            this.title.scale.set(Math.min(1, ViewUtils.elementScaler(this.title, width * 0.8) || 1))

            this.gameThumb.scale.set(ViewUtils.elementScaler(this.gameThumb, 1000, height * 0.35))
            this.contentText.y = this.title.y + this.title.height + 46
            this.contentText.style.wordWrapWidth = width * 0.9;
            //this.contentText.scale.set(Math.min(1, ViewUtils.elementScaler(this.contentText, this.contentText.style.wordWrapWidth, height - this.contentText.y - 20) || 1))
            this.contentText.x = width / 2 - this.contentText.width / 2 //+ width * 0.05


            this.thumbMask.y = 0
            this.thumbMask.width = width
            this.thumbMask.height = height * 0.4

            this.gameThumb.scale.set(ViewUtils.elementEvelop(this.gameThumb, width))
            this.gameThumb.anchor.x = 0.5
            this.gameThumb.anchor.y = 0.5
            this.gameThumb.x = this.thumbMask.width * 0.5
            this.gameThumb.y = this.thumbMask.height * 0.6


            this.textureChanger.scale.set(ViewUtils.elementEvelop(this.textureChanger, width))
            this.textureChanger.x = this.thumbMask.width * 0.5
            this.textureChanger.y = this.thumbMask.height * 0.6

            if (this.video) {
                this.video.scale.set(ViewUtils.elementEvelop(this.video, width + 20))
                this.video.anchor.x = 0.5
                this.video.anchor.y = 0.5
                this.video.x = this.thumbMask.width * 0.5
                this.video.y = this.thumbMask.height * 0.6 - 10

            }

        } else {

            this.title.x = width / 2 + 20
            this.title.y = 20
            this.title.scale.set(Math.min(1, ViewUtils.elementScaler(this.title, width / 2 * 0.8) || 1))


            this.thumbMask.width = width / 2
            this.thumbMask.height = height
            this.thumbMask.y = 0

            this.contentText.x = this.title.x
            this.contentText.y = this.title.y + this.title.height + 50
            //this.contentText.scale.set(Math.min(1, ViewUtils.elementScaler(this.contentText, height - this.contentText.y - 20) || 1))
            this.contentText.style.wordWrapWidth = (width / 2 * 0.9);

            this.gameThumb.scale.set(ViewUtils.elementEvelop(this.gameThumb, height))
            this.gameThumb.anchor.x = 0.5
            this.gameThumb.anchor.y = 0.5
            this.gameThumb.x = this.thumbMask.width * 0.5
            this.gameThumb.y = this.thumbMask.height * 0.5

            this.textureChanger.scale.set(ViewUtils.elementEvelop(this.textureChanger, height))
            this.textureChanger.x = this.thumbMask.width * 0.5
            this.textureChanger.y = this.thumbMask.height * 0.5
            if (this.video) {
                this.video.scale.set(ViewUtils.elementEvelop(this.video, height + 20))
                this.video.anchor.x = 0.5
                this.video.anchor.y = 0.5
                this.video.x = this.thumbMask.width * 0.5
                this.video.y = this.thumbMask.height * 0.5
            }
        }

        if (this.video) {
            this.video.alpha = MathUtils.lerp(this.video.alpha, 1, 0.1);
        }

    }

}