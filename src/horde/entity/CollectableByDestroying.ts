import KinematicBody from 'loggie/core/physics/KinematicBody';
import { PhysicMasks } from 'loggie/core/physics/PhysicMasks';
import { PhysicsLayers } from 'loggie/core/physics/PhysicsLayers';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import GameViewGraphics from 'loggie/core/view/GameViewGraphics';
import GameViewSprite from 'loggie/core/view/GameViewSprite';
import Health from 'loggie/utils/Health';
import Collectable from './Collectable';
export default class CollectableByDestroying extends Collectable {

    constructor() {
        super()
    }

    setUpComponents() {

        this.rigidBody = this.poolComponent(KinematicBody) as KinematicBody;
        this.rigidBody.buildRect(0, 0, this.width, 50)
        this.rigidBody.setSensor(true)

        this.onCollectEntity.removeAll();
        this.health = this.poolComponent(Health) as Health;
        this.health.removeAllSignals();
        this.health.reset(1000);
        this.health.onHealthChange.add(() => {
            this.textField.text = 'Destroy ' + this.health.getCurrentHealth()
        })
        this.health.onKill.add(() => {
            this.onCollectEntity.dispatch(this.GUID)
            this.destroy()
            //this.startDie()
        })
        this.health.refresh()
        this.debug = this.poolComponent(GameViewGraphics);
        this.debug.view.beginFill(0xFF0000).drawRect(-this.width / 2, -this.height, this.width, this.height).alpha = 0.2
        //this.shadow = this.poolComponent(EntityShadow, true);

        this.spriteView = this.poolComponent(GameViewSprite, true, RenderLayers.Gameplay);
        this.textContainer = this.poolComponent(GameViewContainer, true, RenderLayers.Gameplay);
        this.textContainer.addChild(this.textField)
        this.textField.anchor.set(0.5, 1)

    }
    afterBuild(): void {
        super.afterBuild();
        this.rigidBody.setSensor(true);
        this.rigidBody.layerCategory = PhysicsLayers.Enemy
        this.rigidBody.layerMask = PhysicMasks.EnemyCollision
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);
        this.gameObject.rigidBody.targetVelocity.z = 2 * this.loggie.mainCamera.getPositionScale(this.gameObject.transform.position)
    }
}