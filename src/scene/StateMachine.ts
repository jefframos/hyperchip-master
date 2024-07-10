import BaseComponent from "loggie/core/gameObject/BaseComponent";

export enum State {
    Standard,
    SectionOpen
}

interface StateConfig {
    timelineNormal: number;
}

export default class StateMachine extends BaseComponent {
    public currentState: State = State.Standard;
    public timelineNormal: number = 0;
    public transitionNormal: number = 0;
    private transitionSpeed: number = 0;
    private transitionTarget: number = 0;
    private states!: { [key in State]: StateConfig };
    private transitioning: boolean = false;
    private transitionStartNormal: number = 0;
    private transitionEndNormal: number = 0;

    build(
        initialState: State = State.Standard,
        transitionSpeed: number = 0.1,
        statesConfig: { [key in State]: StateConfig }
    ) {
        super.build();
        this.currentState = initialState;
        this.timelineNormal = statesConfig[initialState].timelineNormal;
        this.transitionSpeed = transitionSpeed;
        this.states = statesConfig;
    }

    public setState(newState: State): void {
        if (this.currentState !== newState) {
            this.transitioning = true;
            this.transitionStartNormal = this.timelineNormal;
            this.transitionEndNormal = this.states[newState].timelineNormal;
            this.transitionNormal = 0;
            this.transitionTarget = 1; // Target for transitionNormal to reach

            this.currentState = newState;
        }
    }

    public get stateNormal(): number {
        return this.transitioning ? this.transitionNormal : 1;
    }

    public update(delta: number, unscaledDelta: number): void {
        super.update(delta, unscaledDelta);
        if (!this.transitioning) return;

        // Linear interpolation for transitioning transitionNormal
        this.transitionNormal += (this.transitionTarget - this.transitionNormal) * this.transitionSpeed * delta;

        // Optional: Clamp the value to ensure it remains within [0, 1]
        if (this.transitionNormal > 1) this.transitionNormal = 1;
        if (this.transitionNormal < 0) this.transitionNormal = 0;

        // Update timelineNormal based on the transition progress
        this.timelineNormal = this.transitionStartNormal + (this.transitionEndNormal - this.transitionStartNormal) * this.transitionNormal;

        if (Math.abs(this.transitionNormal - this.transitionTarget) < 0.01) {
            this.transitionNormal = this.transitionTarget;
            this.timelineNormal = this.transitionEndNormal;
            this.transitioning = false;
            // this.emit('transitionComplete', this.currentState);
        }
    }
}
