import MathUtils from 'loggie/utils/MathUtils';
import * as PIXI from 'pixi.js';
type Matrix<T> = T[][];

interface Bounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}
export default class EntityGroup<T> {
    private baseMatrix: Matrix<number>;
    private newMatrix: Matrix<T | null>;
    private flatBaseMatrix: { value: number, rowIndex: number, colIndex: number }[];
    private entityIndex: number;
    private positionOffset: PIXI.Point = new PIXI.Point();
    private smoothOffset: PIXI.Point = new PIXI.Point();
    public entityRadius: number = 60

    constructor(baseMatrix: Matrix<number>, defaultValue: T | null) {
        this.baseMatrix = baseMatrix;
        this.newMatrix = this.createEmptyMatrix(defaultValue);
        this.flatBaseMatrix = this.flattenAndSortBaseMatrix();
        this.entityIndex = 0;
    }

    private createEmptyMatrix(defaultValue: T | null): Matrix<T | null> {
        return this.baseMatrix.map(row => row.map(() => defaultValue));
    }

    private flattenAndSortBaseMatrix(): { value: number, rowIndex: number, colIndex: number }[] {
        return this.baseMatrix
            .flatMap((row, rowIndex) => row.map((value, colIndex) => ({ value, rowIndex, colIndex })))
            .sort((a, b) => a.value - b.value);
    }

    addEntity(entity: T): PIXI.Point {
        if (this.entityIndex < this.flatBaseMatrix.length) {
            const { rowIndex, colIndex } = this.flatBaseMatrix[this.entityIndex];
            this.newMatrix[rowIndex][colIndex] = entity;
            entity.z = 150
            this.entityIndex++;
            this.move(0)
            return new PIXI.Point(rowIndex, colIndex);
        } else {
            throw new Error("All positions in the matrix are already filled.");
        }
    }

    getMatrix(): Matrix<T | null> {
        return this.newMatrix;
    }
    move(direction: number) {
        this.positionOffset.x += direction

    }
    update(delta: number, unscaledTime: number) {
        // this.positionOffset.x = positionTarget.x;
        // this.positionOffset.y = positionTarget.z;

        this.smoothOffset.x = MathUtils.lerp(this.smoothOffset.x, this.positionOffset.x, 0.2)

        const matrixBounds = this.calculateMatrixBounds(this.smoothOffset.x, this.smoothOffset.y)

        const envBounds: Bounds = { minX: -1500, maxX: 1500, minY: -10, maxY: 10 };

        const adjustedOffset = this.adjustOffsetWithinBounds(matrixBounds, envBounds, this.smoothOffset.x, this.smoothOffset.y);

        // Update offset
        this.smoothOffset.x = adjustedOffset.offsetX;
        this.smoothOffset.y = adjustedOffset.offsetY;

        for (let j = 0; j < this.newMatrix.length; j++) {
            for (let i = 0; i < this.newMatrix[j].length; i++) {
                const element = this.newMatrix[j][i];
                if (!element) continue

                const speedFactor = 1 - (j / this.newMatrix.length) * 0.8;
                element.x = MathUtils.lerp(element.x, this.smoothOffset.x + i * this.entityRadius - (this.newMatrix[j].length * this.entityRadius / 2 - this.entityRadius / 2), speedFactor * 0.2 * delta * 60);
                element.z = MathUtils.lerp(element.z, j * this.entityRadius, speedFactor * 0.2);
            }
        }

    }
    calculateMatrixBounds(offsetX: number, offsetY: number): Bounds {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const row of this.newMatrix) {
            for (const entity of row) {
                if (entity) {
                    const { x, y: z } = entity;
                    minX = 0;//Math.min(minX, x - this.entityRadius + offsetX);
                    maxX = 0;//Math.max(maxX, x + this.entityRadius + offsetX);
                    minY = Math.min(minY, z - this.entityRadius + offsetY);
                    maxY = Math.max(maxY, z + this.entityRadius + offsetY);
                }
            }
        }

        return { minX, maxX, minY, maxY };
    }

    adjustOffsetWithinBounds(matrixBounds: Bounds, envBounds: Bounds, offsetX: number, offsetY: number): { offsetX: number, offsetY: number } {
        const matrixWidth = matrixBounds.maxX - matrixBounds.minX;
        const matrixHeight = matrixBounds.maxY - matrixBounds.minY;

        //console.log(matrixWidth, envBounds.maxX, offsetX)

        // Calculate the new offset so that the matrix stays within the environment bounds
        const newOffsetX = Math.max(envBounds.minX, Math.min(envBounds.maxX - matrixWidth, offsetX));
        const newOffsetY = Math.max(envBounds.minY, Math.min(envBounds.maxY - matrixHeight, offsetY));

        return { offsetX: newOffsetX, offsetY: newOffsetY };
    }

}