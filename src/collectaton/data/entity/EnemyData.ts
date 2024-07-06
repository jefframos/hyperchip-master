export class EnemyData {
    public readonly enemyConstructor: any;
    public readonly uid: number;
    public readonly health: number;
    public readonly damage: number;

    constructor(constructor: any, uid: number, health: number, damage: number) {
        this.enemyConstructor = constructor;
        this.uid = uid;
        this.health = health;
        this.damage = damage;
    }
}