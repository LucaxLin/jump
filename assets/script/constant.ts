// Constants.ts
export const BLOCK_SIZE = 64 // 方块像素尺寸（与纹理匹配）
export const PHYSICS_GROUP = {
  DEFAULT: 1 << 0,
  PLAYER: 1 << 1,
  GROUND: 1 << 2,
  TRAP: 1 << 3,
  WALL: 1 << 4
}
