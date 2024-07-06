import KinematicBody from 'loggie/core/physics/KinematicBody';
import { PhysicMasks } from 'loggie/core/physics/PhysicMasks';
import { PhysicsLayers } from 'loggie/core/physics/PhysicsLayers';
import RigidBody from 'loggie/core/physics/RigidBody';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import GameViewGraphics from 'loggie/core/view/GameViewGraphics';
import GameViewSprite from 'loggie/core/view/GameViewSprite';
import Collectable from './Collectable';
export default class UpgradePickup extends Collectable {
    constructor() {
        super()
    }

    setUpComponents() {
        this.onCollectEntity.removeAll();

        this.rigidBody = this.poolComponent(KinematicBody) as KinematicBody;
        this.rigidBody.layerCategory = PhysicsLayers.PlayerOnly
        this.rigidBody.layerMask = PhysicMasks.PlayerOnlyCollision
        this.rigidBody.onCollisionEnter = (rb: RigidBody) => {
            this.onCollectEntity.dispatch(this.GUID, rb.gameObject.GUID)
        }
        this.rigidBody.buildRect(0, 0, this.width, 50)
        this.rigidBody.setSensor(true)

        // this.health = this.poolComponent(Health) as Health;
        // this.health.removeAllSignals();
        // this.health.reset(200);
        // this.health.onHealthChange.add(() => {
        //     this.textField.text = 'UPGRADE ' + this.health.getCurrentHealth()
        // })
        // this.health.onKill.add(() => {

        //     //console.log('kill')
        //     //this.destroy()
        // })
        // this.health.refresh();
        this.debug = this.poolComponent(GameViewGraphics);
        this.debug.view.beginFill(0x0000FF).drawRect(-this.width / 2, -this.height, this.width, this.height).alpha = 0.2
        //this.shadow = this.poolComponent(EntityShadow, true);

        this.spriteView = this.poolComponent(GameViewSprite, true, RenderLayers.Gameplay);
        this.textContainer = this.poolComponent(GameViewContainer, true, RenderLayers.Gameplay);
        this.textContainer.addChild(this.textField)
        this.textField.anchor.set(0.5, 1)
        this.textField.text = 'UPGRADE '

    }

    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);
        this.gameObject.rigidBody.targetVelocity.z = 2 * this.loggie.mainCamera.getPositionScale(this.gameObject.transform.position)
    }


}