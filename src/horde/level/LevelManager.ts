import Spawner from "./Spawner";
import { LevelData, Wave } from "./Wave";

export default class LevelManager {
    private levels: LevelData[] = [];
    private currentLevelIndex: number = 0;
    private spawner: Spawner | null = null;
    public onSpawn: (wave: Wave) => void = () => { };
    public onWaveEnd: () => void = () => { };
    public onMessage: (message: string) => void = () => { };

    loadLevels(levelFiles: LevelData): void {
        this.levels.push(levelFiles);
    }

    startLevel(levelIndex: number): void {
        if (levelIndex < this.levels.length) {
            this.currentLevelIndex = levelIndex;
            this.spawner = new Spawner(this.levels[levelIndex], this.onSpawn, this.onWaveEnd, this.onMessage);
        }
    }

    update(deltaTime: number): void {
        if (this.spawner) {
            this.spawner.update(deltaTime);
        }
    }
}