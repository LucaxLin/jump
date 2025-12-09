import { _decorator, Component, instantiate, Prefab, Vec3 } from 'cc'
import { FloorBlock } from './FloorBlock'
import { BLOCK_SIZE } from './constant'
const { ccclass, property } = _decorator

@ccclass('floorManager')
export class floorManager extends Component {
  @property({ type: Prefab, tooltip: 'floor预制体' })
  floorBlockPrefab: Prefab = null!
  @property({ tooltip: '地板起始位置' })
  startPos: Vec3 = new Vec3(0, 0, 0)
  @property({ tooltip: '地板长度（方块数量）' })
  floorLength: number = 10
  public floorBlocks: FloorBlock[] = []
  start() {
    this.generateFloor()
  }
  generateFloor() {
    for (let i = 0; i < this.floorLength; i++) {
      // 创建方块节点
      const blockNode = instantiate(this.floorBlockPrefab)
      blockNode.name = 'floorBlock' // 设置节点名称
      blockNode.parent = this.node
      // 计算位置（按网格排列）
      const blockPos = new Vec3(
        this.startPos.x + i * BLOCK_SIZE,
        this.startPos.y,
        this.startPos.z
      )
      blockNode.setPosition(blockPos)
      // 缓存方块引用
      const floorBlock = blockNode.getComponent(FloorBlock)!
      this.floorBlocks.push(floorBlock)
    }
  }
  update(deltaTime: number) {}
}
