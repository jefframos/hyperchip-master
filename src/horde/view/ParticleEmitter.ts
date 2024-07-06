import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
 import { Emitter, EmitterConfigV3 } from '@pixi/particle-emitter';
import GameView from 'loggie/core/view/GameView';
export default class  ParticleEmitter extends GameView {
    public emitter:Emitter = new Emitter();
    build(emitterConfig: EmitterConfigV3){
        super.build();
        this.emitter.init(emitterConfig);      
    }

    update(delta:number, unscaledTime:number){
        super.update(delta, unscaledTime);
        this.emitter?.update(delta);
    }
    destroy(): void {
        super.destroy();
        this.emitter.cleanup()
    }
}