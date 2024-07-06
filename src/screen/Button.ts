import * as PIXI from 'pixi.js';
import Loggie from 'loggie/core/Loggie';
import GameObject from 'loggie/core/gameObject/GameObject';
import RenderModule from 'loggie/core/render/RenderModule';
import { Signal } from 'signals';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
export default class Button extends GameObject {
    public gameView!: GameViewContainer;
    private nameLabel!: PIXI.Text;
    private shape!: PIXI.Graphics;
    private dragging = false;
    private originalPosition;
    private newPosition;
    private canDrag = true;
    public data:any;
    public onClick:Signal = new Signal();
    public onDragOver:Signal = new Signal();
    constructor() {
        super()
       
    }
    onDragStart(event) {
        this.dragging = true;
        this.originalPosition = event.data.global.clone();
        this.gameView.view.alpha = 0.5;
        this.onClick.dispatch();
    }
    
    onDragEnd() {
        this.gameView.view.alpha = 1;

        if(!this.dragging) return;
        this.dragging = false;
        this.onDragOver.dispatch();

    }

    onDragMove(event) {
        if(!this.canDrag) return;
        if (this.dragging) {
            this.newPosition = event.data.global.clone();
            let newPositionX = this.x + (this.newPosition.x - this.originalPosition.x);
            let newPositionY = this.z + (this.newPosition.y - this.originalPosition.y);
            this.x = newPositionX
            this.z = newPositionY;
            this.originalPosition = this.newPosition;
        }
    }
    build(data:any, canDrag:boolean) {
        super.build();

        this.gameView = this.poolComponent(GameViewContainer);
        
        let gradientColors = [0xFF0000, 0xFFFF00];
        let gradientPositions = [0, 1];
        this.shape = new PIXI.Graphics().beginFill(0x262626).drawRoundedRect(0,0,160,70,10)
        this.gameView.view.addChild(this.shape)
        
        this.nameLabel = new PIXI.Text('Test', {align:'center', fontSize:24, fill:0xFFFFFF})
        this.gameView.view.addChild(this.nameLabel)
        this.nameLabel.anchor.set(0.5)
        this.nameLabel.x = this.shape.width / 2
        this.nameLabel.y = this.shape.height / 2
        
        
        this.gameView.view.interactive = true;
        this.gameView.view.cursor = 'pointer';
        
        this.gameView.layer = RenderLayers.UILayerOverlay
        this.gameView.view
            .on('mousedown', this.onDragStart.bind(this))
            .on('touchstart', this.onDragStart.bind(this))
            .on('mouseup', this.onDragEnd.bind(this))
            .on('mouseupoutside', this.onDragEnd.bind(this))
            .on('touchend', this.onDragEnd.bind(this))
            .on('touchendoutside', this.onDragEnd.bind(this))
            .on('mousemove', this.onDragMove.bind(this))
            .on('touchmove', this.onDragMove.bind(this));

        this.canDrag = canDrag;
        this.data = data;
    }   
}