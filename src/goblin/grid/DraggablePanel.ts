import LoggieApplication from 'loggie/LoggieApplication';
import GameObject from 'loggie/core/gameObject/GameObject';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewGraphics from 'loggie/core/view/GameViewGraphics';
import MathUtils from 'loggie/utils/MathUtils';
import * as PIXI from 'pixi.js';
import { Signal } from 'signals';


export default class DraggablePanel extends GameObject {
    private isDragging: boolean = false;
    private waitingDrag: boolean = false;
    private startPoint: PIXI.Point = new PIXI.Point();
    private currentPoint: PIXI.Point = new PIXI.Point();
    private lastPoint: PIXI.Point = new PIXI.Point();
    private velocity: PIXI.Point = new PIXI.Point();
    private threshold: number = 10;
    private inertiaThreshold: number = 5;
    private inertiaFriction: number = 0;
    private dragableShape!: GameViewGraphics;
    public onDragStart: Signal = new Signal();
    public onDragEnd: Signal = new Signal();
    public onDragUpdate: Signal = new Signal();
    public onRelativeDragUpdate: Signal = new Signal();

    build() {
        super.build();
        this.isDragging = false;
        this.waitingDrag = false;
        this.startPoint = new PIXI.Point();
        this.currentPoint = new PIXI.Point();
        this.lastPoint = new PIXI.Point();
        this.velocity = new PIXI.Point();
        this.threshold = 10;
        this.inertiaThreshold = 5;
        this.inertiaFriction = 0.95;

        this.dragableShape = this.poolComponent(GameViewGraphics, true, RenderLayers.UILayerOverlay)
        this.dragableShape.view.beginFill(0xFF0000).drawRect(0, 0, 500, 500).alpha = 0


        LoggieApplication.onPointerDown.add(this.onStart.bind(this))
        LoggieApplication.onPointerUp.add(this.onEnd.bind(this))
    }

    private onStart(event: PointerEvent): void {
        this.startDrag(LoggieApplication.globalPointer.x, LoggieApplication.globalPointer.y);
    }

    private onEnd(): void {
        this.endDrag();
    }

    public startDrag(x: number, y: number): void {
        this.isDragging = true;
        this.waitingDrag = true;
        this.startPoint.set(x, y);
        this.lastPoint.set(x, y);  // Reset lastPoint to origin for new drag
        this.currentPoint.set(x, y);  // Reset currentPoint to origin for new drag
        this.velocity.set(0, 0);

        this.onDragStart.dispatch()
    }


    public updateDrag(x: number, y: number): void {
        let deltaX = x - this.startPoint.x;
        let deltaY = y - this.startPoint.y;

        if (this.isDragging) {

            if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) >= this.threshold) {
            } else {
                return
            }

            const dragDistance = MathUtils.distance(deltaX, deltaY, this.currentPoint.x, this.currentPoint.y)
            this.currentPoint.set(deltaX, deltaY);

            this.velocity.x = MathUtils.lerp(this.velocity.x, deltaX - this.lastPoint.x, 0.2)
            this.velocity.y = MathUtils.lerp(this.velocity.y, deltaY - this.lastPoint.y, 0.2)

            this.lastPoint.set(deltaX, deltaY);
            if (dragDistance > 100) {
                return;
            }
            this.onDragUpdate.dispatch(this.currentPoint.x, this.currentPoint.y)
            this.onRelativeDragUpdate.dispatch(this.currentPoint.x - this.startPoint.x, this.currentPoint.y - this.startPoint.y)
        }
    }

    public endDrag(): void {
        if (this.isDragging) {
            this.isDragging = false;

            this.onDragEnd.dispatch()


            if (Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y) > this.inertiaThreshold) {
                requestAnimationFrame(this.applyInertia.bind(this));
            }
        }
    }

    update(delta: number, unscaledDelta: number): void {
        super.update(delta, unscaledDelta)
        if (this.isDragging) {
            this.updateDrag(LoggieApplication.globalPointer.x, LoggieApplication.globalPointer.y);
        }
    }
    private applyInertia(): void {
        this.velocity.x *= this.inertiaFriction;
        this.velocity.y *= this.inertiaFriction;

        this.currentPoint.x += this.velocity.x;
        this.currentPoint.y += this.velocity.y;

        this.onDragUpdate.dispatch(this.currentPoint.x, this.currentPoint.y)
        this.onRelativeDragUpdate.dispatch(this.currentPoint.x - this.startPoint.x, this.currentPoint.y - this.startPoint.y)

        if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
            requestAnimationFrame(this.applyInertia.bind(this));
        }
    }

    public getPosition(): PIXI.Point {
        return this.currentPoint.clone();
    }
}