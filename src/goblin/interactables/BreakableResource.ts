import BounceBehaviour from 'loggie/fx/fxBehaviours/BounceBehaviour';
import FlashBehaviour2 from 'loggie/fx/fxBehaviours/FlashBehaviour2';
import ShakeRotationBehaviour from 'loggie/fx/fxBehaviours/ShakeRotationBehaviour';
import ShakeScaleBehaviour from 'loggie/fx/fxBehaviours/ShakeScaleBehaviour';
import TextBehaviour, { TextAnimation } from 'loggie/fx/fxBehaviours/TextBehaviour';
import Health from 'loggie/utils/Health';
import InteractiveEventUtils from 'loggie/utils/InteractiveEventUtils';
import Ease from 'loggie/utils/tween2/Ease';
import * as PIXI from 'pixi.js';
import { Fonts } from '../../Templates';
import EntityShadow from '../../shared/components/EntityShadow';
import WorldInteractable from './WorldInteractable';
export default class BreakableResource extends WorldInteractable {
    private health!: Health;

    constructor() {
        super()
    }
    build() {
        super.build();

        this.poolComponent(EntityShadow, true, PIXI.Texture.from('shadow'), 120)

        this.health = this.poolComponent(Health, true)
        this.health.reset(100)
        this.health.onDamage.add((currentHealth: number, amount: number) => {
            this.damage(amount)
        })
        this.health.onKill.add((currentHealth: number, amount: number) => {
            this.kill()
        })

        InteractiveEventUtils.addClickTap(this.container.view, (event) => {
            this.health.damage(50)
        });
    }
    setUpView(): void {
        super.setUpView();
        this.spriteView.texture = PIXI.Texture.from('tree1')
        this.spriteView.anchor.set(0.5, 0.95)
        this.spriteView.scale.set(0.8)
        this.container.addChild(this.spriteView)
    }
    damage(value: number) {
        this.fxManager.addBehaviour(ShakeRotationBehaviour, true, true, this.spriteView, 0.15, 0.1)
        this.fxManager.addBehaviour(ShakeScaleBehaviour, true, true, this.spriteView, 0.15, 0.1)
        this.fxManager.addBehaviour(BounceBehaviour, true, true, this.spriteView, 2, 0.15, 25)

        //if (this.health.getCurrentHealth() > 20)
        this.fxManager.addBehaviour(FlashBehaviour2, true, true, this.spriteView, 0xFFFFFF, 1, 0.1)
        //target: PIXI.Container, label: string, animation: TextAnimation, duration: number
        const text: TextAnimation = {
            duration: 0.5,
            textAnchor: new PIXI.Point(0.5, 0.5),
            // position: {
            //     start: { min: new PIXI.Point(0, -200), max: new PIXI.Point(0, -150) },
            //     end: new PIXI.Point(0, -250),
            // },
            textAnimation: { start: 0, end: value, round: 1, duration: 0.1, suffix: '' },
            force: { min: new PIXI.Point(-50, -550), max: new PIXI.Point(50, -600) },
            gravity: { min: new PIXI.Point(0, 3000), max: new PIXI.Point(0, 4000) },
            startPosition: { min: new PIXI.Point(0, -150), max: new PIXI.Point(0, -200) },
            rotation: {
                start: { min: -0.5, max: 0.5 },
                end: { min: 0, max: 0 },
                ease: Ease.easeOutBack
            },
            scale: {
                start: new PIXI.Point(1.5, 0.5),
                end: new PIXI.Point(1, 1),
                ease: Ease.easeOutElastic
            },
            color: {
                start: 0xFF0000,
                end: 0xFFFFFF,
                duration: 0.1
            },
            alpha: {
                start: 1,
                end: 0,
                duration: 0.5,
                delayedExecution: 0.25
            },
            textStyle: Fonts.mainStyle
        }
        this.fxManager.addBehaviour(TextBehaviour, false, false, this.container, 'Test', text, 1)
    }
    kill(): void {
        super.kill();
        const behaviour = this.fxManager.addBehaviour(FlashBehaviour2, false, false, this.spriteView, 0xFF0000, 1, 0.1, 0.5)
        if (behaviour) {
            this.fxManager.addCallback(behaviour?.GUID, () => {
                this.wipe()
            })
        }
        InteractiveEventUtils.removeEvents(this.container.view);

    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);
    }
}