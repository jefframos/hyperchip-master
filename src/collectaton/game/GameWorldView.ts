import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import SessionPlayerData from './data/SessionPlayerData';
import TwinStickControlledPhysicObject from 'loggie/core/input/twinStick/TwinStickControlledPhysicObject';
import Vector3 from 'loggie/core/gameObject/Vector3';
import GameViewGraphics from 'loggie/core/view/GameViewGraphics';
import InputControlledPhysicObject from 'loggie/core/input/InputControlledPhysicObject';
import Ground from '../entity/components/Ground';
import GameEntity from '../../shared/entity/GameEntity';
import { SpawnData } from '../data/entity/EnemySpawnerData';
import AiGameEntity from '../entity/AiGameEntity';
import PlayerGameEntity from '../entity/PlayerGameEntity';
import MockPlayer from '../entity/MockPlayer';
import Companion from '../entity/Companion';
import Wander from 'loggie/ai/Wander';
export default class GameWorldView extends GameObject {
    private ground!: Ground;
    private player!: GameEntity;
    private debug!:GameObject

    private cameraTopLeft!:GameObject;
    private cameraTopRight!:GameObject;
    private cameraBottomLeft!:GameObject;
    private cameraBottomRight!:GameObject;
    constructor() {
        super()
    }
    build() {
        super.build();
        this.loggie.mainCamera.forceZoom(0.8)

        //this.ground = this.loggie.poolGameObject(Ground, true)

        this.cameraTopLeft = this.poolGameObject(GameObject)
        this.cameraTopLeft.poolComponent(GameViewGraphics, true).view.beginFill(0xFF0000).drawCircle(0, 0, 5)

        this.cameraTopRight = this.poolGameObject(GameObject)
        this.cameraTopRight.poolComponent(GameViewGraphics, true).view.beginFill(0xFF00FF).drawCircle(0, 0, 5)

        this.cameraBottomLeft = this.poolGameObject(GameObject)
        this.cameraBottomLeft.poolComponent(GameViewGraphics, true).view.beginFill(0xFFFF00).drawCircle(0, 0, 5)

        this.cameraBottomRight = this.poolGameObject(GameObject)
        this.cameraBottomRight.poolComponent(GameViewGraphics, true).view.beginFill(0x00FF00).drawCircle(0, 0, 5)
    }
    spawnPlayer(entityData: SessionPlayerData): GameEntity {
        this.player = this.loggie.poolGameObject(PlayerGameEntity, true, entityData)
        this.player.rigidBody.x = 0
        this.player.rigidBody.z = 0
        

        return this.player;
    }

    spawnCompanion(): Companion {
        const companion = this.loggie.poolGameObject(Companion, true) as Companion
        companion.rigidBody.x = 0
        companion.rigidBody.z = 0
        

        return companion;
    }


    spawnEnemies(spawnData: SpawnData[]): GameEntity[] {

        const entities: GameEntity[] = [];

        spawnData.forEach(element => {
            const entity = this.loggie.poolGameObject(AiGameEntity, true) as AiGameEntity
            entity.rigidBody.x = this.loggie.mainCamera.cameraViewBounds.center.x + element.positionX * this.loggie.mainCamera.cameraViewBounds.width / 2
            entity.rigidBody.z = this.loggie.mainCamera.cameraViewBounds.center.y + element.positionY * this.loggie.mainCamera.cameraViewBounds.height / 2 
            entities.push(entity)
            entity.aiBehaviour.follow.targetSpeed = 5 + Math.random() * 2
            entity.aiBehaviour.tofollow = this.player
        });
        

        return entities

    }
    spawnMockPlayer() : MockPlayer{
        const entity = this.loggie.poolGameObject(MockPlayer, true) as MockPlayer

        return entity;
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        if (this.player) {
            this.loggie.mainCamera.setFollowPoint(this.player.transform.position)
        } else {
            this.loggie.mainCamera.setFollowPoint(Vector3.ZERO)
        }

        this.cameraTopLeft.x = this.loggie.mainCamera.cameraViewBounds.x
        this.cameraTopLeft.z = this.loggie.mainCamera.cameraViewBounds.y

        this.cameraTopRight.x = this.loggie.mainCamera.cameraViewBounds.x + this.loggie.mainCamera.cameraViewBounds.width
        this.cameraTopRight.z = this.loggie.mainCamera.cameraViewBounds.y

        this.cameraBottomLeft.x = this.loggie.mainCamera.cameraViewBounds.x
        this.cameraBottomLeft.z = this.loggie.mainCamera.cameraViewBounds.y + this.loggie.mainCamera.cameraViewBounds.height

        this.cameraBottomRight.x = this.loggie.mainCamera.cameraViewBounds.x + this.loggie.mainCamera.cameraViewBounds.width
        this.cameraBottomRight.z = this.loggie.mainCamera.cameraViewBounds.y + this.loggie.mainCamera.cameraViewBounds.height

    }
}