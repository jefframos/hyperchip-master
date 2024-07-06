import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import BaseComponent from 'loggie/core/gameObject/BaseComponent';
import Sensor from 'loggie/core/utils/Sensor';
import RigidBody from 'loggie/core/physics/RigidBody';
import AiBehaviour from './AiBehaviour';
import EntityValue from './EntityValue';
import { Signal } from 'signals';
export default class CaptureHandler extends BaseComponent {
    private entityValue!: EntityValue;
    private executing!: boolean;
    protected collideBuffer: AiBehaviour[] = [];
    private splinePoints: GameObject[] = [];

    private entities: (AiBehaviour | null)[] = [];

    public onEntityCaptured:Signal = new Signal();

    constructor() {
        super()
        this.entities = new Array(20).fill(null);
    }
    build(entityValue: EntityValue) {
        super.build();

        this.entityValue = entityValue;

        this.executing = false;


    }
    updatePoints(splinePoints: GameObject[]) {
        this.splinePoints = splinePoints;
    }
    checkEntity(go: RigidBody) {
        const aiEntity = go.gameObject.findComponentInParent(AiBehaviour) as AiBehaviour
        
        if (!aiEntity || !aiEntity.canCapture) {
            return
        }      
        aiEntity.captured(this);
        for (let index = 0; index < this.entities.length; index++) {
            const element = this.entities[index];
            if (element?.GUID == aiEntity.GUID) {
                return;
            }
        }
        if (aiEntity) {
            this.addEntity(aiEntity)
        }
    }

    async addEntity(entity: AiBehaviour) {
        const index = this.entities.indexOf(null);
        if (index !== -1) {
            this.entities[index] = entity;

            entity.setToIgnore()

            this.collideBuffer.push(entity)

            this.onEntityCaptured.dispatch(entity.gameObject);

        } else {
            return //is full
        }


        //return
        // Merge if there are more than two entities


    }
    async checkMerges() {

        if (this.entities.filter(e => e !== null).length >= 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.mergeEntities();
        }

    }
    private sortEntities() {
        this.entities.sort((a, b) => {
            if (a === null && b === null) return 0;
            if (a === null) return 1;
            if (b === null) return -1;
            return b.value - a.value;
        });
    }
    private async mergeEntities() {
        this.sortEntities();

        this.executing = true;
        if (this.entities[0] && this.entities[0].value == this.entityValue.value) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 1 second delay
            //this.entities[0]?.gameObject.destroy()
            this.entities[0]?.mergeTo(this.gameObject)
            this.entities[0] = null
            this.entityValue.value *= 2;
            await this.mergeEntities();
        }
        for (let i = 0; i < this.entities.length - 1; i++) {
            if (this.collideBuffer.includes(this.entities[i])) continue;

            if (this.entities[i] && this.entities[i]?.value === this.entities[i + 1]?.value && this.entities[i]?.canCollide === this.entities[i + 1]?.canCollide) {
                this.entities[i].value *= 2;
                this.entities[i + 1]?.mergeTo(this.entities[i]?.gameObject)
                this.entities[i + 1] = null
                await new Promise(resolve => setTimeout(resolve, 500)); // 1 second delay
                await this.mergeEntities();
                break;
            }
        }

        this.executing = false;
    }
    moveEntitiesDown() {
        for (let i = 1; i < this.entities.length; i++) {
            if (this.entities[i] === null) {
                let j = i + 1;
                while (j < this.entities.length && this.entities[j] === null) {
                    j++;
                }
                if (j < this.entities.length) {
                    this.entities[i] = this.entities[j];
                    this.entities[j] = null;
                }
            }
        }
    }
    
    removeEntity(entity:AiBehaviour){
        const index = this.entities.indexOf(entity)
        if(index >= 0){
            this.entities[index] = null;
            this.moveEntitiesDown();
            this.moveEntitiesDown();
        }
    }
    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);

        for (let index = 0; index < this.splinePoints.length; index++) {
            if (this.entities[index]) {
                this.entities[index].tofollow = this.splinePoints[index]
            }
        }

        if (this.executing) {
            return;
        }
        for (let index = this.collideBuffer.length - 1; index >= 0; index--) {
            const element = this.collideBuffer[index];

            if (element.canCollide) {
                this.collideBuffer.splice(index, 1)

                this.checkMerges();
                break
            }

        }
    }
}