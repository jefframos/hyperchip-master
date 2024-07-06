import GameObject from 'loggie/core/gameObject/GameObject';
import SurviveGameplaySessionManager from '../../collectaton/game/SurviveGameplaySessionManager';
import BaseWeapon from '../../shared/components/BaseWeapon';
import GameEntity from '../../shared/entity/GameEntity';
import RunForwardPlayer from '../../shared/entity/RunForwardPlayer';
import { WeaponEnum } from '../../shared/weapon/WeaponEnum';
import { WeaponGameData } from '../../shared/weapon/WeaponGameData';
import LevelManager from '../level/LevelManager';
import { Wave, WaveType } from '../level/Wave';
import HordeSessionView from '../view/HordeSessionView';
import SpawnerRegion from './SpawnerRegion';
import WeaponUpgradeSystem from './WeaponUpgradeSystem';
export type WeaponLevel = {
    baseWeapon: BaseWeapon,
    level: integer
}
export type PlayerWeaponMultiplier = {
    weaponData: WeaponGameData,
    multiplier: Partial<WeaponGameData>
}
export default class HordeGameSessionController extends GameObject {
    private sessionManager: SurviveGameplaySessionManager = new SurviveGameplaySessionManager();
    private gameWorldView!: HordeSessionView;
    private player!: GameEntity;
    private viewEntities: Array<GameObject> = [];
    private spawners: SpawnerRegion[] = [];
    private levelManager!: LevelManager;
    private weaponSystem: WeaponUpgradeSystem = new WeaponUpgradeSystem();

    private activeCollectables: Map<integer, string> = new Map();
    private activePlayers: Map<integer, RunForwardPlayer> = new Map();


    private players: RunForwardPlayer[] = []

    startSession(levelManager: LevelManager, gameWorldView: HordeSessionView) {

        this.levelManager = levelManager;

        this.activeCollectables.clear();
        this.activePlayers.clear();

        this.levelManager.onSpawn = this.handleSpawn.bind(this);
        this.levelManager.onWaveEnd = this.handleWaveEnd.bind(this);
        this.levelManager.onMessage = this.handleMessage.bind(this);

        this.levelManager.startLevel(0)
        this.weaponSystem.resetSystem();
        this.gameWorldView = gameWorldView;
        this.gameWorldView.onAddPlayer.add(() => { this.addPlayer() })
        this.gameWorldView.onUpgradeWeapon.add(() => { this.upgradeWeapon() })
        this.gameWorldView.onCollectCollectable.add((guid: integer, collector: integer) => { this.checkCollectable(guid, collector) })

        this.startTurn()

    }
    async startTurn() {

        this.spawnPlayer()

    }
    addPlayer() {
        this.spawnPlayer()

    }
    handleWaveEnd(): void {
        console.log('handleWaveEnd')

        //this.gameView.waveEnded();
    }

    handleMessage(message: string): void {
        console.log(message)
        //this.gameView.showMessage(message);
    }
    handleSpawn(wave: Wave): void {
        console.log(`Spawning ${wave.quantity} ${wave.type} in lane ${wave.lane}`);
        //this.gameWorldView.spawnEntity(type, lane);

        const entities = this.gameWorldView.spawnEntity(wave)

        if (wave.type == WaveType.Upgrade || wave.type == WaveType.Destroyable) {
            entities.forEach(element => {
                this.activeCollectables.set(element.GUID, wave.type + '' + element.GUID)
            });
        }
        //sets the entity data and views
        for (let index = 0; index < entities.length; index++) {
            const element = entities[index];
            element.onRemoveEntity.add((toRemove: GameEntity) => { this.removeEntity(toRemove) })
            element.onWipe.add((toRemove: GameEntity) => { this.wipeEntity(toRemove) })
        }

        this.viewEntities.push(...entities)
    }
    checkCollectable(guid: integer, collector: integer = -1) {
        if (this.activeCollectables.has(guid)) {
            console.log(this.activeCollectables.get(guid))
        }

        if (this.activePlayers.has(collector)) {
            const player = this.activePlayers.get(collector)
            //console.log(player?.holdingWeapon)
            if (player) {
                this.weaponSystem.addPlayerMultipliers(player, { shootFrequency: 0.8, damage: 1.1 })
            }
        }

    }
    startLevel(levelIndex: number): void {
        this.levelManager.startLevel(levelIndex);
    }

    upgradeWeapon() {
        this.players.forEach(element => {
            const weapon = this.weaponSystem.applyUpdateCard(element, WeaponEnum.Rifle);
            if (weapon) {
                element.setWeapon(weapon)
            }
        });
    }
    wipeEntity(toRemove: GameEntity) {
        this.gameWorldView.enemyWipe(toRemove)
    }
    removeEntity(toRemove: GameEntity) {
        this.gameWorldView.enemyDead(toRemove)
        this.viewEntities = this.viewEntities.filter(entity => entity.GUID == toRemove.GUID)

    }
    spawnPlayer() {
        const player = this.gameWorldView.addNewPlayer(RunForwardPlayer) as RunForwardPlayer;
        console.log(player)
        player.baseWidth = 300;
        player.setAsPlayer()
        player.transform.lookAtAngle = -3.14 / 2
        player.rigidBody.z = 450
        this.viewEntities.push(player);

        if (this.weaponSystem.latestAddedWeapon) {
            player.setWeapon(this.weaponSystem.addPlayerWeapon(player, this.weaponSystem.latestAddedWeapon.weaponType, this.weaponSystem.latestAddedWeapon.level))
        } else {
            player.setWeapon(this.weaponSystem.addPlayerWeapon(player, WeaponEnum.Rifle, 0))
        }

        this.activePlayers.set(player.GUID, player)
        this.players.push(player)
    }
    update(delta: number, unscaledDelta: number): void {
        super.update(delta, unscaledDelta);

        this.levelManager.update(delta)
        this.viewEntities = this.viewEntities.filter(entity => !entity.destroyed)

        for (let index = 0; index < this.weaponSystem.allWeapons.length; index++) {
            const element = this.weaponSystem.allWeapons[index];
            element?.setTargets(this.viewEntities)
        }

        if (Math.random() < 0.3 && this.viewEntities.length < 100) {
            this.sessionManager.spawnWave(1)
        }

    }
    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}