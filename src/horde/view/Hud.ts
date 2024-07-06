import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewSprite from 'loggie/core/view/GameViewSprite';
import { Signal } from 'signals';
export default class Hud extends GameObject {
    private hudContainer!: GameViewContainer;
    private button1: PIXI.Sprite = new PIXI.Sprite();
    private button2: PIXI.Sprite = new PIXI.Sprite();

    public onUpgradeWeapon: Signal = new Signal();
    public onAddPlayer: Signal = new Signal();

    build() {
        super.build();

        this.hudContainer = this.addNewComponent(GameViewContainer, true, RenderLayers.UILayerOverlay)
        
        this.button1.texture = PIXI.Texture.from('buttons/square_button_0001')
        this.hudContainer.view.addChild(this.button1)
        this.button1.interactive = true;
        this.button1.x = 50
        this.button1.y = 120
        this.button1.cursor = 'pointer'
        this.button1.onpointerup = (e) => {
           this.onUpgradeWeapon.dispatch();
        }


        this.button2.texture = PIXI.Texture.from('buttons/square_button_0002')
        this.hudContainer.view.addChild(this.button2)
        this.button2.interactive = true;
        this.button2.x = 50
        this.button2.y = 200
        this.button2.cursor = 'pointer'
        this.button2.onpointerup = (e) => {
           this.onAddPlayer.dispatch();
        }

    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);
    }
}