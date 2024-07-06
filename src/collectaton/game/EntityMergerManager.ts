import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import { Signal } from 'signals';
import SessionPlayerData from './data/SessionPlayerData';
export default class  EntityMergerManager {
    public onSpawnPlayer:Signal = new Signal();
    public onSpawnEnemies:Signal = new Signal();
    public onAfterCollection:Signal = new Signal();
    public onUpdateParenting:Signal = new Signal();
    public gameplayEntityList:Array<SessionPlayerData> = [];
    public playerEntity!:SessionPlayerData;
    constructor(){
    }

    startSession(){
        this.playerEntity = new SessionPlayerData(1, 2);
        this.onSpawnPlayer.dispatch(this.playerEntity);
    }
    collect(collector:SessionPlayerData, collected:SessionPlayerData){

        if(collector.value == collected.value){
            collector.value *= 2;
            this.onAfterCollection.dispatch(collector, collected)
        }else{
            collector.children = collected;
            this.onUpdateParenting.dispatch(collector, collected)
        }
    }
   
}