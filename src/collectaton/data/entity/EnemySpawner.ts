import * as PIXI from 'pixi.js';

import { SpawnData, SpawnLocation, SpawnerOptions } from "./EnemySpawnerData"

export default class EnemySpawner {
    public enemies: SpawnData[] = [];
    private options: SpawnerOptions;
    private enemiesCounter: number = 0;
    constructor(options: SpawnerOptions) {
        this.options = options;
    }

    spawnEnemy(amount: number): SpawnData[] {
        if (this.enemiesCounter >= this.options.maxEnemies) {
            console.log("Cannot spawn more enemies. Max enemies reached.");
            return [];
        }
        if (this.enemiesCounter + amount >= this.options.maxEnemies) {
            amount = this.options.maxEnemies - this.enemiesCounter;
        }

        const currentSpawn = [];
        for (let i = 0; i < amount; i++) {
            const spawnPosition = this.calculateSpawnPosition()

            const spawn: SpawnData = {
                enemy: this.options.enemyTypes[0],
                positionX: spawnPosition.x,
                positionY: spawnPosition.y
            }
            this.enemies.push(spawn);
            currentSpawn.push(spawn)
        }
        return currentSpawn
    }
    removeEnemy(enemyId:integer){
        this.enemies = this.enemies.filter(enemy => enemy.enemy.uid != enemyId)
    }
    private calculateSpawnPosition(): PIXI.Point {
        const position = new PIXI.Point();
        let target = this.options.spawnLocation;
        if (target == SpawnLocation.Anywhere) {
            target = Math.floor(Math.random() * 4);
        }
        switch (target) {
            case SpawnLocation.Left:
                position.x = -1;
                position.y = Math.random() * 2 - 1
                break;
            case SpawnLocation.Right:
                position.x = 1;
                position.y = Math.random() * 2 - 1
                break;
            case SpawnLocation.Top:
                position.x = Math.random() * 2 - 1
                position.y = -1;
                break;
            case SpawnLocation.Down:
                position.x = Math.random() * 2 - 1
                position.y = 1;
                break;
        }

        return position;
    }
}
