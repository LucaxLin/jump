// Constants.ts
export const BLOCK_SIZE = 64; // 方块像素尺寸（与纹理匹配）
export const PHYSICS_GROUP = {
    FLOOR: 1 << 0, // 地板分组
    PLAYER: 1 << 1, // 玩家分组
    TRAP: 1 << 2 // 陷阱分组（挪动后的方块可归为该组）
};