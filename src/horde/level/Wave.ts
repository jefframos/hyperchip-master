export interface Wave {
    time: number;
    type: WaveType;
    quantity?: number;
    lane?: number;
    customTotalLanes?: number;
    message?: string;
    warning?: string;
    avoidRandom?: boolean;
}

export interface LevelData {
    level: number;
    totalEnemiesToKill: number;
    boss: boolean;
    lanes: number;
    waves: Wave[];
}

export enum WaveType {
    EnemyStandard = 'enemy_standard',
    EnemyElite = 'enemy_elite',
    MiniBoss = 'mini_boss',
    Boss = 'boss',
    Upgrade = 'upgrade',
    Destroyable = 'destroyable',
    Obstacle = 'obstacle',
    Message = 'message'  // Added for the message type
  }