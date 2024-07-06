import * as PIXI from 'pixi.js';
import CardinalAnimator from '../../loggie/src/utils/components/CardinalAnimator';
import { CardinalAnimationMap, CardinalDirection } from 'loggie/core/utils/Cardinals';
import { AnimationsStruct } from '../assets/AnimationsStruct';
export class EntityAnimationStruct {
    public Run: CardinalAnimationMap | undefined = undefined;
    public Idle: CardinalAnimationMap | undefined = undefined;
    public Death: CardinalAnimationMap | undefined = undefined;
}
export default class EntityViewLookup {

    static Soldier1: EntityAnimationStruct = {
        Run: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Soldiers_hawk1, 'Soldiers_hawk1_run_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest], 15),
        Idle: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Soldiers_hawk1, 'Soldiers_hawk1_idle_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest],12),
        Death: undefined
    }

    static Soldier2: EntityAnimationStruct = {
        Run: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Soldiers_skull1, 'Soldiers_skull1_run_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest], 15),
        Idle: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Soldiers_skull1, 'Soldiers_skull1_idle_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest],12),
        Death: undefined
    }

    static Soldier3: EntityAnimationStruct = {
        Run: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Soldiers_skull3, 'Soldiers_skull3_run_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest], 15),
        Idle: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Soldiers_skull3, 'Soldiers_skull3_idle_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest],12),
        Death: undefined
    }

    static Soldier4: EntityAnimationStruct = {
        Run: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Soldiers_skull4, 'Soldiers_skull4_run_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest], 15),
        Idle: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Soldiers_skull4, 'Soldiers_skull4_idle_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest],12),
        Death: undefined
    }

    static Techna: EntityAnimationStruct = {
        Run: CardinalAnimator.animationSetHelper(AnimationsStruct.Horde.Horde.Techna, 'Techna_walk_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest], 20),
        Idle: CardinalAnimator.animationSetHelper(AnimationsStruct.Horde.Horde.Techna, 'Techna_idle_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest],10),
        Death: undefined
    }
    static Zombie3: EntityAnimationStruct = {
        Run: CardinalAnimator.animationSetHelper(AnimationsStruct.Horde.Horde.Zombie3, 'Zombie3_walk_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest], 10),
        Idle: CardinalAnimator.animationSetHelper(AnimationsStruct.Horde.Horde.Zombie3, 'Zombie3_idle_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest],8),
        Death: undefined
    }
    static Skinless: EntityAnimationStruct = {
        Run: CardinalAnimator.animationSetHelper(AnimationsStruct.Horde.Horde.Skinless, 'Skinless_walk_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest], 10),
        Idle: CardinalAnimator.animationSetHelper(AnimationsStruct.Horde.Horde.Skinless, 'Skinless_idle_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest],8),
        Death: undefined
    }

    static SZombie1: EntityAnimationStruct = {
        Run: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Zombie_1, 'Zombie_1_walk_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest], 12),
        Idle: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Zombie_1, 'Zombie_1_idle_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest],8),
        Death: undefined
    }

    static SZombie2: EntityAnimationStruct = {
        Run: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Zombie_2, 'Zombie_2_walk_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest], 12),
        Idle: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Zombie_2, 'Zombie_2_idle_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest],8),
        Death: undefined
    }

    static SZombie3: EntityAnimationStruct = {
        Run: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Zombie_3, 'Zombie_3_walk_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest], 12),
        Idle: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Zombie_3, 'Zombie_3_idle_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest],8),
        Death: undefined
    }

    static SZombie4: EntityAnimationStruct = {
        Run: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Zombie_4, 'Zombie_4_walk_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest], 12),
        Idle: CardinalAnimator.animationSetHelper(AnimationsStruct.Survival.Characters.Zombie_4, 'Zombie_4_idle_', [CardinalDirection.West, CardinalDirection.NorthWest, CardinalDirection.SouthWest],8),
        Death: undefined
    }
}