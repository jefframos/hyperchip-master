import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import SurviveGameplaySessionManager, { GameplayType } from './SurviveGameplaySessionManager';
import GameWorldView from './GameWorldView';
import SessionPlayerData from './data/SessionPlayerData';
import GameObject from 'loggie/core/gameObject/GameObject';
import GameEntity from '../../shared/entity/GameEntity';
import BaseWeapon from '../../shared/components/BaseWeapon';
import { WeaponEnum } from '../../shared/weapon/WeaponEnum';
import EntityViewLookup from '../../shared/EntityViewLookup';
import WeaponLookup from '../../shared/weapon/WeaponLookup';
import Wander from 'loggie/ai/Wander';
export default class GameSessionController extends GameObject {
    private sessionManager: SurviveGameplaySessionManager = new SurviveGameplaySessionManager();
    private gameWorldView!: GameWorldView;
    private player!: GameEntity;
    private activeWeapon!: BaseWeapon;
    private viewEntities: Array<GameObject> = [];

    startSession(gameWorldView: GameWorldView) {

        this.gameWorldView = gameWorldView;
        this.sessionManager.onStartGame.add(() => { this.startTurn() })
        this.sessionManager.onSpawnEnemy.add((data: any) => { this.spawnEnemy(data) })
        this.sessionManager.setUpTurn(WeaponEnum.Pistol, GameplayType.FreeForm)
        this.sessionManager.startGame();
    }
    async startTurn() {
        this.spawnPlayer({})
        //this.sessionManager.spawnWave(1)
        return
        await this.delay(250);
        for (let index = 0; index < 250; index++) {

            this.sessionManager.spawnWave(2)
            await this.delay(10);
        }
    }
    spawnEnemy(data) {

        //console.log('sapwn enemy', data)

        const enemies = this.gameWorldView.spawnEnemies(data)

        enemies.forEach(element => {
            element.setupAnimator(EntityViewLookup.Zombie3)
            element.onRemoveEntity.add((toRemove: GameEntity) => { this.removeEntity(toRemove) })
            element.baseWidth = 400;

        });

        this.viewEntities.push(...enemies)

    }
    removeEntity(toRemove: GameEntity) {
        //this.viewEntities = this.viewEntities.filter(entity => entity.GUID == toRemove.GUID)

    }
    spawnPlayer(entityData: SessionPlayerData) {
        this.player = this.gameWorldView.spawnPlayer(entityData);
        this.player.setupAnimator(EntityViewLookup.Lady)
        this.player.baseWidth = 400;

        this.viewEntities.push(this.player);
        this.activeWeapon = this.player.poolGameObject(BaseWeapon) as BaseWeapon
        this.activeWeapon.build(WeaponLookup.instance.getLeveldEntityData(WeaponEnum.Rifle, 3), WeaponLookup.instance.getEntityView(WeaponEnum.Rifle))
        this.activeWeapon.setAreaMultiplier(3)

        // const companion = this.gameWorldView.spawnCompanion();
        // companion.setupAnimator(EntityViewLookup.Taipan)

        // const companionWeapon =companion.poolGameObject(BaseWeapon) as BaseWeapon
        // companionWeapon.build(WeaponLookup.instance.getLeveldWeaponData(WeaponEnum.Pistol, 2), WeaponLookup.instance.getWeaponView(WeaponEnum.Pistol))
        // companionWeapon.setAreaMultiplier(30)

        // this.player.addFollower(companion)

        // const companion2 = this.gameWorldView.spawnCompanion();
        // companion2.setupAnimator(EntityViewLookup.Squid)

        // const companionWeapon2 =companion2.poolGameObject(BaseWeapon) as BaseWeapon
        // companionWeapon2.build(WeaponLookup.instance.getLeveldWeaponData(WeaponEnum.Shotgun, 2), WeaponLookup.instance.getWeaponView(WeaponEnum.Shotgun))
        // companionWeapon2.setAreaMultiplier(30)

        // this.player.addFollower(companion2, 1)


        // const companion3 = this.gameWorldView.spawnCompanion();
        // companion3.setupAnimator(EntityViewLookup.Pudu)

        // const companionWeapon3 =companion3.poolGameObject(BaseWeapon) as BaseWeapon
        // companionWeapon3.build(WeaponLookup.instance.getLeveldWeaponData(WeaponEnum.Shotgun, 2), WeaponLookup.instance.getWeaponView(WeaponEnum.Shotgun))
        // companionWeapon3.setAreaMultiplier(30)

        // this.player.addFollower(companion3, 2)

        // const mock = this.gameWorldView.spawnMockPlayer()
        // mock.rigidBody.x = -350
        // mock.rigidBody.z = -150
        // mock.setupAnimator(EntityViewLookup.Mage)


        // const mock2 = this.gameWorldView.spawnMockPlayer()
        // mock2.rigidBody.x = 350
        // mock2.rigidBody.z = -550
        // mock2.setupAnimator(EntityViewLookup.Knight)

        // setTimeout(() => {
        //     console.log(this.viewEntities)
        //     //mock.captureHandler.checkEntity(this.viewEntities[0].rigidBody)
        //     mock.captureHandler.checkEntity(this.viewEntities[1].rigidBody)
        //     mock.captureHandler.checkEntity(this.viewEntities[2].rigidBody)
        //     mock.captureHandler.checkEntity(this.viewEntities[3].rigidBody)
        //     mock.captureHandler.checkEntity(this.viewEntities[4].rigidBody)
        //     mock.captureHandler.checkEntity(this.viewEntities[5].rigidBody)
        // }, 1000);
    }
    update(delta: number, unscaledDelta: number): void {
        super.update(delta, unscaledDelta);

        this.viewEntities = this.viewEntities.filter(entity => !entity.destroyed)
        this.activeWeapon?.setTargets(this.viewEntities)

        if (Math.random() < 0.3 && this.viewEntities.length < 100) {
            this.sessionManager.spawnWave(1)
        }

    }
    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}