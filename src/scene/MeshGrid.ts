import GameObject from 'loggie/core/gameObject/GameObject';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewContainer from 'loggie/core/view/GameViewContainer';
import GameViewSprite from 'loggie/core/view/GameViewSprite';
import MathUtils from 'loggie/utils/MathUtils';
import * as PIXI from 'pixi.js';
import { Signal } from 'signals';
import DragHandler from './DragHandler';
import { GameData } from './HyperchipGame';
import MainTiledMesh from './MainTiledMesh';

export interface TextureData {
    texture: string;
    id: number;
}

enum MeshGridState {
    IDLE,
    TRANSITIONING
}

export default class MeshGrid extends GameObject {
    private meshGrid: MainTiledMesh[] = [];
    private cellSize: number = 512;
    private gameData!: Map<string, GameData>;
    private textures: GameData[] = [];
    private rows: number = 5;
    private cols: number = 5;
    private targetPosition: PIXI.Point = new PIXI.Point();
    private currentPosition: PIXI.Point = new PIXI.Point();
    private transitionSpeed: number = 80; // Adjust this value for desired speed
    private state: MeshGridState = MeshGridState.IDLE;
    public dragHandler: DragHandler = new DragHandler();

    public blocker!: GameViewSprite;
    public textContainer!: GameViewContainer;
    public text: PIXI.Text = new PIXI.Text();
    public locked: boolean = false;

    public onTileSelected: Signal = new Signal();


    constructor() {
        super();
    }

    build(gameData: Map<string, GameData>) {
        super.build();

        this.gameData = gameData;

        this.blocker = this.poolComponent(GameViewSprite, true, RenderLayers.UILayerOverlay, PIXI.Texture.WHITE)
        this.blocker.view.scale.set(500)
        this.blocker.view.interactive = true;
        this.blocker.view.alpha = 0

        for (const [key, value] of this.gameData) {
            //console.log(`Key: ${key}, Value: ${value}`);
            this.textures.push(value)
        }

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const textureIndex = (col + row * this.cols) % this.textures.length;
                const gameData = this.textures[textureIndex];
                const mesh = this.poolGameObject(MainTiledMesh, true, gameData.mainThumb, this.cellSize);
                mesh.userData = { id: gameData.id };  // Store the id in userData
                this.meshGrid.push(mesh);

                mesh.onTileSelected.add((meshSelected: MainTiledMesh) => {
                    this.onTileSelected.dispatch(meshSelected.userData.id);
                })

                mesh.x = (col - Math.floor(this.cols / 2)) * this.cellSize;
                mesh.z = (row - Math.floor(this.rows / 2)) * this.cellSize;
            }
        }
    }

    update(delta: number, unscaledTime: number) {
        super.update(delta, unscaledTime);
        const normalizedDeltaTime = delta * 60 * 50;
        const dragVelocity = this.dragHandler.getVelocity()

        this.blocker.view.visible = this.dragHandler.isMoving

        if (this.state === MeshGridState.IDLE && !this.locked) {
            const speed = (1 / delta / 60) * 2//PIXI.isMobile.any ? 20 : 2;
            this.setOffset(dragVelocity, normalizedDeltaTime);
        } else if (this.state === MeshGridState.TRANSITIONING) {
            this.updateTransition(delta * 60);
        }
    }

    setOffset(offset: PIXI.Point, scale: number = 1) {
        const moveX = offset?.x || 0;
        const moveY = offset?.y || 0;

        // Calculate the angle and distance based on the offset
        const angle = Math.atan2(moveY, moveX) || 0;
        const moveDistance = Math.sqrt(moveX * moveX + moveY * moveY) * scale || 0;

        const dist = this.cellSize * 2.5;
        const offsetJump = this.cellSize * 5;
        let index = 0;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const mesh = this.meshGrid[index];

                // Update the position based on the angle and move distance
                mesh.x = mesh.transform.position.x + Math.cos(angle) * moveDistance;
                mesh.z = mesh.transform.position.z + Math.sin(angle) * moveDistance;

                if (mesh.x < -dist) {
                    mesh.x += offsetJump;
                }
                if (mesh.x > dist) {
                    mesh.x -= offsetJump;
                }

                if (mesh.z < -dist) {
                    mesh.z += offsetJump;
                }
                if (mesh.z > dist) {
                    mesh.z -= offsetJump;
                }

                const distance = Math.floor(MathUtils.distance(mesh.x, mesh.z, 0, 0));
                mesh.worldMesh.customZIndex = -distance * 2;
                index++;
            }
        }
    }

    findMeshById(id: string): MainTiledMesh | null {
        return this.meshGrid.find(mesh => mesh.userData.id === id) || null;
    }

    moveToId(id: string): MainTiledMesh | undefined {
        const targetMesh = this.findMeshById(id);
        if (!targetMesh) {
            console.error(`Mesh with id ${id} not found`);
            return;
        }

        this.targetPosition.set(-targetMesh.x, -targetMesh.z);
        this.currentPosition.set(0, 0);
        this.state = MeshGridState.TRANSITIONING;

        return targetMesh;
    }

    updateTransition(delta: number) {
        const angle = Math.atan2(this.targetPosition.y - this.currentPosition.y, this.targetPosition.x - this.currentPosition.x);
        const distance = MathUtils.distance(this.currentPosition.x, this.currentPosition.y, this.targetPosition.x, this.targetPosition.y);
        const moveDistance = Math.min(this.transitionSpeed * delta, distance);
        const moveX = Math.cos(angle) * moveDistance;
        const moveY = Math.sin(angle) * moveDistance;

        this.currentPosition.set(this.currentPosition.x + moveX, this.currentPosition.y + moveY);

        this.setOffset(new PIXI.Point(moveX, moveY), 1);

        if (distance <= this.transitionSpeed * delta) {
            this.state = MeshGridState.IDLE;
        }
    }
}
