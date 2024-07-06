import { LevelData, Wave } from "./Wave";

export default class Spawner {
    private currentLevel: LevelData;
    private currentWaveIndex: number = 0;
    private timer: number = 0;
    private onSpawn: (wave: Wave) => void;
    private onWaveEnd: () => void;
    private onMessage: (message: string) => void;
    constructor(levelData: LevelData, onSpawn: (wave: Wave) => void, onWaveEnd: () => void,
        onMessage: (message: string) => void) {
        this.currentLevel = levelData;
        this.onSpawn = onSpawn;
        this.onWaveEnd = onWaveEnd;
        this.onMessage = onMessage
    }

    update(deltaTime: number): void {
        this.timer += deltaTime;

        if (this.currentWaveIndex < this.currentLevel.waves.length) {
            const currentWave = this.currentLevel.waves[this.currentWaveIndex];
            if (this.timer >= currentWave.time) {
                if (currentWave.warning) {
                    this.onMessage(currentWave.warning);
                }

                if (currentWave.type === 'message' && currentWave.message) {
                    this.onMessage(currentWave.message);
                } else {
                    this.spawnWave(currentWave);
                }

                this.currentWaveIndex++;

                if (this.currentWaveIndex === this.currentLevel.waves.length) {
                    this.onWaveEnd();
                }
            }
        }
    }

    spawnWave(wave: Wave): void {
        for (let i = 0; i < wave.quantity; i++) {
            this.onSpawn(wave);
        }
    }
}
