import GameObject from 'loggie/core/gameObject/GameObject';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import FxBehaviourManager from 'loggie/fx/FxBehaviourManager';
import InteractiveEventUtils from 'loggie/utils/InteractiveEventUtils';
import * as PIXI from 'pixi.js';
import { Signal } from 'signals';
export default class WorldInteractable extends GameObject {
    protected fxManager!: FxBehaviourManager;
    protected spriteView: PIXI.Sprite = new PIXI.Sprite();
    protected container!: GameViewContainer;
    public onRemove: Signal = new Signal();
    public onCollect: Signal = new Signal();
    constructor() {
        super()
    }
    build() {
        super.build();
        this.container = this.poolComponent(GameViewContainer, true)
        this.fxManager = this.poolComponent(FxBehaviourManager, true)
    }
    setUpView() {

    }
    wipe() {
        this.onRemove.dispatch()
    }
    kill() {
    }

    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);
    }
    destroy(): void {
        this.container.view.interactive = false;
        InteractiveEventUtils.removeEvents(this.container.view);
        super.destroy();
    }
}