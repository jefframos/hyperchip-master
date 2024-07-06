import GridGenerator from "../GridGenerator";

export default class Pathfinder {
    private grid: GridGenerator;

    constructor(grid: GridGenerator) {
        this.grid = grid;
    }

    public findPath(startX: number, startY: number, targetX: number, targetY: number): { points: { x: number, y: number }[], distance: number } | null {
        // Initialize open and closed sets
        const openSet: { x: number, y: number }[] = [{ x: startX, y: startY }];
        const cameFrom: { [key: string]: { x: number, y: number } } = {};
        const gScore: { [key: string]: number } = {};
        const fScore: { [key: string]: number } = {};

        gScore[`${startX},${startY}`] = 0;
        fScore[`${startX},${startY}`] = this.heuristic(startX, startY, targetX, targetY);

        while (openSet.length > 0) {
            let current: { x: number, y: number } | undefined = openSet[0];
            let currentIndex = 0;

            // Find the node in the open set with the lowest fScore
            openSet.forEach((node, index) => {
                if (fScore[`${node.x},${node.y}`] < fScore[`${current!.x},${current!.y}`]) {
                    current = node;
                    currentIndex = index;
                }
            });

            // If the current node is the target, reconstruct the path
            if (current && current.x === targetX && current.y === targetY) {
                let currentPoint = current;
                const path: { x: number, y: number }[] = [current];
                let distance = 0;

                while (cameFrom[`${currentPoint.x},${currentPoint.y}`]) {
                    currentPoint = cameFrom[`${currentPoint.x},${currentPoint.y}`];
                    path.unshift(currentPoint);
                    distance += 1; // Increment distance for each step
                }

                return { points: path, distance };
            }

            openSet.splice(currentIndex, 1);

            // Get neighbors of the current node
            const neighbors = this.grid.getNeighbors(current!.x, current!.y);

            for (const neighbor of neighbors) {
                const tentativeGScore = gScore[`${current!.x},${current!.y}`] + 1; // Assuming constant cost between tiles

                if (tentativeGScore < (gScore[`${neighbor.x},${neighbor.y}`] || Infinity)) {
                    // This path to the neighbor is better than any previous one. Record it!
                    cameFrom[`${neighbor.x},${neighbor.y}`] = current!;
                    gScore[`${neighbor.x},${neighbor.y}`] = tentativeGScore;
                    fScore[`${neighbor.x},${neighbor.y}`] = tentativeGScore + this.heuristic(neighbor.x, neighbor.y, targetX, targetY);

                    if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        // No path found
        return null;
    }

    private heuristic(x1: number, y1: number, x2: number, y2: number): number {
        // Manhattan distance heuristic
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
}