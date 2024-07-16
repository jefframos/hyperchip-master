import * as PIXI from 'pixi.js';

export default class CycleTextureChanger extends PIXI.Container {
    private currentSprite: PIXI.Sprite;
    private transitionSprite: PIXI.Sprite;
    private textures: PIXI.Texture[] = [];
    private currentIndex: number;
    private elapsedTime: number;
    private cycleDuration: number;
    private fadeDuration: number;
    private fadingOut: boolean;
    private fadeProgress: number;

    constructor(cycleDuration = 5, fadeDuration = 1) {
        super();

        this.currentIndex = 0;
        this.elapsedTime = 0;
        this.cycleDuration = cycleDuration; // convert to milliseconds
        this.fadeDuration = fadeDuration; // convert to milliseconds
        this.fadingOut = false;
        this.fadeProgress = 0;

        this.currentSprite = new PIXI.Sprite();
        this.currentSprite.anchor.set(0.5);
        this.currentSprite.position.set(0, 0);

        this.transitionSprite = new PIXI.Sprite();
        this.transitionSprite.anchor.set(0.5);
        this.transitionSprite.position.set(0, 0);
        this.transitionSprite.alpha = 0;

        this.addChild(this.currentSprite);
        this.addChild(this.transitionSprite);
    }

    setTextures(textures: PIXI.Texture[]) {
        this.textures = textures;
        this.currentSprite.texture = textures[0];
        this.fadingOut = false;
        this.fadeProgress = 0;
        this.currentIndex = 0;
        this.elapsedTime = 0;
    }

    update(delta: number) {
        this.elapsedTime += delta; // Convert delta to milliseconds

        if (this.fadingOut) {
            this.fadeProgress += delta / this.fadeDuration; // Update fade progress

            if (this.fadeProgress >= 1) {
                this.fadeProgress = 0;
                this.fadingOut = false;
                this.currentIndex = (this.currentIndex + 1) % this.textures.length;

                // Swap the textures
                const tempSprite = this.currentSprite;
                this.currentSprite = this.transitionSprite;
                this.transitionSprite = tempSprite;

                // Reset the transition sprite for the next fade
                this.transitionSprite.alpha = 0;
                this.transitionSprite.texture = this.textures[this.currentIndex];
            }

            this.applyFade();
        } else if (this.elapsedTime >= this.cycleDuration) {
            this.elapsedTime = 0;
            this.fadingOut = true;

            // Prepare the transition sprite with the next texture
            this.transitionSprite.alpha = 0;
            this.transitionSprite.texture = this.textures[(this.currentIndex + 1) % this.textures.length];
        }
    }

    private applyFade() {
        if (this.fadingOut) {
            this.transitionSprite.alpha = this.fadeProgress;
            this.currentSprite.alpha = 1 - this.fadeProgress;
        }
    }
}