import GameObject from 'loggie/core/gameObject/GameObject';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewMesh from 'loggie/core/view/GameViewMesh';
import GameViewSprite from 'loggie/core/view/GameViewSprite';
import GameViewUtils from 'loggie/core/view/GameViewUtils';
import ViewUtils from 'loggie/utils/ViewUtils';
import * as PIXI from 'pixi.js';
import TestMesh1 from './TestMesh1';
export default class HyperchipGame extends GameObject {
    private logo?: GameViewSprite;
    private topVignette?: GameViewSprite;
    private pinkMask?: GameViewSprite;
    private meshTest?: GameViewMesh;
    constructor() {
        super()
    }
    build() {
        super.build();

        this.pinkMask = GameViewUtils.makeSprite(this, PIXI.Texture.from('pink-mask'), RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.topVignette = GameViewUtils.makeSprite(this, PIXI.Texture.from('top-glow'), RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        this.logo = GameViewUtils.makeSprite(this, PIXI.Texture.from('logo'), RenderLayers.UILayerOverlay).findComponent<GameViewSprite>(GameViewSprite)
        const mesh1 = this.poolGameObject(TestMesh1, true)

    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        if (this.logo) {
            if (PIXI.isMobile.any) {

                this.logo.view.scale.set(ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.right * 0.4, this.loggie.overlay.right * 0.4))
            } else {

                this.logo.view.scale.set(Math.min(1, ViewUtils.elementScaler(this.logo.view, this.loggie.overlay.right * 0.2, this.loggie.overlay.right * 0.2)))
            }
        }

        if (this.topVignette) {
            this.topVignette.view.width = this.loggie.overlay.right
        }
        if (this.pinkMask) {
            this.pinkMask.view.width = this.loggie.overlay.right
            this.pinkMask.view.height = this.loggie.overlay.down
            this.pinkMask.view.alpha = 0.5
        }
    }
}