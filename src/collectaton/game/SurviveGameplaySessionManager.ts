import { Signal } from "signals";
import EnemySpawner from "../data/entity/EnemySpawner";
import { WeaponEnum } from "../../shared/weapon/WeaponEnum";
import { EnemyData } from "../data/entity/EnemyData";
import { SpawnLocation } from "../data/entity/EnemySpawnerData";
import EntityLookup from "../../shared/entity/EntityLookup";

export enum GameplayType {
    FreeForm = 0,
    Arena = 1,
    Defense = 2
}

type GameplayConfig = {
    spawner:EnemySpawner
}

export default class SurviveGameplaySessionManager {
    public onStartGame:Signal = new Signal();
    public onEndTurn:Signal = new Signal();
    public onSpawnEnemy:Signal = new Signal();

    private weaponId:WeaponEnum = WeaponEnum.Pistol;
    private turnTimer:number = 0;

    private gameplayConfigMap:Map<GameplayType, GameplayConfig> = new Map();
    public currentGameType:GameplayType = GameplayType.FreeForm;
    constructor(){

        const entity = EntityLookup.instance.getEntity('zombie1')
        const enemyDataTest:EnemyData = new EnemyData('', 1,20,10);
        const arenaSpawner = new EnemySpawner({
            enemyLevel:1,
            maxEnemies:50,
            spawnLocation:SpawnLocation.Anywhere,
            enemyTypes:[entity]
        })

        const freeFormSpawner = new EnemySpawner({
            enemyLevel:1,
            maxEnemies:500,
            spawnLocation:SpawnLocation.Anywhere,
            enemyTypes:[entity]
        })

        const towerDefenseSpawner = new EnemySpawner({
            enemyLevel:1,
            maxEnemies:50,
            spawnLocation:SpawnLocation.Top,
            enemyTypes:[entity]
        })

        this.gameplayConfigMap.set(GameplayType.Arena,{
            spawner:arenaSpawner
        })

        this.gameplayConfigMap.set(GameplayType.FreeForm,{
            spawner:freeFormSpawner
        })

        this.gameplayConfigMap.set(GameplayType.Defense,{
            spawner:towerDefenseSpawner
        })

    }
  
    startGame(){
        this.onStartGame.dispatch('', this.weaponId, this.currentGameType)
        this.turnTimer = 0;
    }
    setUpTurn(weaponId:WeaponEnum, gameplayType:GameplayType){
        this.weaponId = weaponId;
        this.currentGameType = gameplayType;
    }
    checkNewSpawn(){
        this.spawnWave(1)
        // if(this.turnTimer > 30){
        //     this.spawnWave(3)
        // }
    }
    removeEnemy(enemyId:integer){
        this.gameplayConfigMap.get(this.currentGameType)?.spawner.removeEnemy(enemyId)
    }
    spawnWave(total:number){
        
        this.onSpawnEnemy.dispatch(this.gameplayConfigMap.get(this.currentGameType)?.spawner.spawnEnemy(total))   
    }
    updateTime(delta:number){
        this.turnTimer += delta;
    }
}