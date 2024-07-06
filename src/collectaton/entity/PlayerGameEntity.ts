import * as PIXI from 'pixi.js';

import InputControlledPhysicObject from 'loggie/core/input/InputControlledPhysicObject';
import HunterEntity from './HunterEntity';
import GameEntity from '../../shared/entity/GameEntity';
export default class PlayerGameEntity extends HunterEntity {  
    build() {
        super.build();
        this.poolComponent(InputControlledPhysicObject, true, 8);
    }
    
}