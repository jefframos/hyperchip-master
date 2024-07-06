import BounceBehaviour from 'loggie/fx/fxBehaviours/BounceBehaviour';
import PositionTweenBehaviour from 'loggie/fx/fxBehaviours/PositionTweenBehaviour';
import ShakeScaleBehaviour from 'loggie/fx/fxBehaviours/ShakeScaleBehaviour';
import InteractiveEventUtils from 'loggie/utils/InteractiveEventUtils';
import Ease from 'loggie/utils/tween2/Ease';
import * as PIXI from 'pixi.js';
import { Fonts } from '../../Templates';
import EntityShadow from '../../shared/components/EntityShadow';
import WorldInteractable from './WorldInteractable';
export default class CollectableResource extends WorldInteractable {
    private text: PIXI.Text = new PIXI.Text('', Fonts.mainStyle)
    constructor() {
        super()
    }
    build() {
        super.build();
        this.poolComponent(EntityShadow, true, PIXI.Texture.from('shadow'), 50)
        InteractiveEventUtils.addClickTap(this.container.view, (event) => {
            this.collect();
        });
    }
    collect() {
        this.fxManager.addBehaviour(ShakeScaleBehaviour, true, true, this.spriteView, 0.15, 0.1)
        //this.spriteView.y = 0
        const target = this.spriteView.position.clone();
        target.y -= 50
        const behaviour = this.fxManager.addBehaviour(PositionTweenBehaviour, false, false, this.spriteView, this.spriteView.position, target, 0.25) as PositionTweenBehaviour
        behaviour.easing = Ease.easeOutBack
        if (behaviour) {
            this.fxManager.addCallback(behaviour?.GUID, () => {
                this.onCollect.dispatch();
                this.onCollect.removeAll()
            })
        }

        InteractiveEventUtils.removeEvents(this.container.view);
    }
    setUpView() {
        this.spriteView.texture = PIXI.Texture.from('tree-log')
        this.spriteView.anchor.set(0.5, 0.9)
        this.spriteView.scale.set(0.8)
        this.spriteView.y = 0
        this.container.addChild(this.spriteView)
        this.container.addChild(this.text)
    }
    afterBuild(): void {
        super.afterBuild()
        this.fxManager.addBehaviour(BounceBehaviour, true, true, this.spriteView, 1, 0.2, 40)
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        this.text.text = this.spriteView.y
    }
}