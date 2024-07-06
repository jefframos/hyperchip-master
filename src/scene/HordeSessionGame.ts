import * as PIXI from 'pixi.js';
import BaseGame from '../../loggie/src/core/game/BaseGame';
import HordeGameSessionController from '../horde/game/HordeGameSessionController';
import LevelManager from '../horde/level/LevelManager';
import HordeSessionView from '../horde/view/HordeSessionView';
export default class HordeSessionGame extends BaseGame {

    private gameWorldView!: HordeSessionView;
    private surviveSessionController!: HordeGameSessionController;

    build() {

        super.build();

        const level = PIXI.Assets.cache.get('level1.json')
        const levelManager = new LevelManager()
        levelManager.loadLevels(level)
        this.gameWorldView = this.loggie.poolGameObject(HordeSessionView, true) as HordeSessionView
        this.surviveSessionController = this.loggie.poolGameObject(HordeGameSessionController, true)
        this.surviveSessionController.startSession(levelManager, this.gameWorldView);
    }

    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);
    }
}