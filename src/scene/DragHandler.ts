import * as PIXI from 'pixi.js';
export default class DragHandler {
    private prevX: number = 0;
    private prevY: number = 0;
    private currentX: number = 0;
    private currentY: number = 0;
    private startTime: number = 0;
    private endTime: number = 0;
    private velocityX: number = 0;
    private velocityY: number = 0;
    private isDragging: boolean = false;
    private inertiaInterval: number = 10; // Interval for applying inertia in milliseconds
    private inertiaId: number | null = null;
    private dampingFactor: number = 0.95; // Damping factor to gradually slow down

    constructor() {
        // Initialize event listeners or setup for drag events
        // For example, mouse or touch event listeners
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    onMouseDown(event: MouseEvent) {
        this.isDragging = true;
        this.startTime = performance.now();
        this.prevX = event.clientX;
        this.prevY = event.clientY;

        // Clear any existing inertia intervals
        this.clearInertia();
    }

    onMouseMove(event: MouseEvent) {
        if (this.isDragging) {
            this.currentX = event.clientX;
            this.currentY = event.clientY;

            // Calculate velocity
            this.endTime = performance.now();
            let deltaTime = this.endTime - this.startTime;
            let deltaX = this.currentX - this.prevX;
            let deltaY = this.currentY - this.prevY;
            this.velocityX = deltaX / deltaTime; // Velocity in pixels per millisecond
            this.velocityY = deltaY / deltaTime; // Velocity in pixels per millisecond

            // Update previous positions and time
            this.prevX = this.currentX;
            this.prevY = this.currentY;
            this.startTime = this.endTime;
        }
    }

    onMouseUp(event: MouseEvent) {
        this.isDragging = false;
        this.startTime = 0;
        this.endTime = 0;

        // Apply inertia if there's velocity
        if (Math.abs(this.velocityX) > 0 || Math.abs(this.velocityY) > 0) {
            this.applyInertia();
        }
    }

    private applyInertia() {
        const applyInertiaFrame = () => {
            this.velocityX *= this.dampingFactor;
            this.velocityY *= this.dampingFactor;

            // Update positions based on velocity
            this.prevX += this.velocityX * this.inertiaInterval;
            this.prevY += this.velocityY * this.inertiaInterval;

            // Trigger a move event as if the user is still dragging
            // You may have your own logic to handle the movement update
            // For demonstration, let's console log the positions
            //console.log(`Simulated Movement - X: ${this.prevX.toFixed(2)}, Y: ${this.prevY.toFixed(2)}`);

            // Continue applying inertia until velocity is negligible
            if (Math.abs(this.velocityX) > 0.01 || Math.abs(this.velocityY) > 0.01) {
                this.inertiaId = window.requestAnimationFrame(applyInertiaFrame);
            } else {
                this.clearInertia();
            }
        };

        this.inertiaId = window.requestAnimationFrame(applyInertiaFrame);
    }

    private clearInertia() {
        if (this.inertiaId !== null) {
            window.cancelAnimationFrame(this.inertiaId);
            this.inertiaId = null;
        }
    }

    // Expose velocity for external use
    public getVelocity(): PIXI.Point {
        return new PIXI.Point(this.velocityX, this.velocityY);
    }

}