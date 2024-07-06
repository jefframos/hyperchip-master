import { LootTableEntry, Resource } from "./ResourceManager";

export interface LootTableData {
    entries: LootTableEntry[];
    forceToSpawn: boolean;
    maxItems: number;
}

export default class ResourceCollectableSpawner {
    static generateLoot(resource: Resource, lootTableData: LootTableData): { type: string, amount: number }[] {
        const itemsToSpawn = this.calculateLoot(lootTableData);
        return itemsToSpawn;
    }

    private static calculateLoot(lootTableData: LootTableData): { type: string, amount: number }[] {
        const loot: { type: string, amount: number }[] = [];

        lootTableData.entries.forEach(entry => {
            if (loot.length >= lootTableData.maxItems) {
                return;
            }

            if (Math.random() <= entry.chance) {
                const amount = Math.floor(Math.random() * (entry.maxAmount - entry.minAmount + 1)) + entry.minAmount;
                loot.push({ type: entry.type, amount });
            }
        });

        // If loot is empty and forceToSpawn is enabled, add the item with the highest chance to appear
        if (loot.length === 0 && lootTableData.forceToSpawn) {
            let maxChanceEntry: LootTableEntry | null = null;

            lootTableData.entries.forEach(entry => {
                if (!maxChanceEntry || entry.chance > maxChanceEntry.chance) {
                    maxChanceEntry = entry;
                }
            });

            if (maxChanceEntry) {
                const amount = Math.floor(Math.random() * (maxChanceEntry.maxAmount - maxChanceEntry.minAmount + 1)) + maxChanceEntry.minAmount;
                loot.push({ type: maxChanceEntry.type, amount });
            }
        }

        return loot;
    }
}
