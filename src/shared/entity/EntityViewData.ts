
export type SingleAnimationSetup = {
    animationPath:string;
    fps:integer;
    extras:any
}
export type EntityAnimationSet = {
    run: SingleAnimationSetup;
    idle: SingleAnimationSetup;
    death: SingleAnimationSetup;
    hit: SingleAnimationSetup;
    attack: SingleAnimationSetup;
}

export enum EntityViewAnimationType {
    SingleSprite = 1,
    Direction2 = 2,
    Direction4 = 3,
    AllCardinal = 4,
    SingleAnimation = 5,
}
export type EntityViewData = {
    
    readonly id: string;
    readonly sprite: string;    
    readonly animationSet: EntityAnimationSet
    readonly animationType: EntityViewAnimationType;
    readonly anchor: {x:number,y:number};
}