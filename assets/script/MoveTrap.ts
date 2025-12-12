import { _decorator, Component, Node, Vec2, Vec3 } from 'cc'
const { ccclass, property } = _decorator
import { Trap } from './Trap'
@ccclass('MoveTrap')
export class MoveTrap extends Trap {
  @property({ type: Node, tooltip: 'player 节点' })
  player: Node = null
  private triggered: boolean = false
  start() {}

  update(deltaTime: number) {
    // 当玩家X轴进入陷阱时，陷阱向右移动100px
    if (this.player.position.x >= this.node.position.x && !this.triggered) {
      this.force.x = -200
      this.node.position = new Vec3(
        this.node.position.x + 100,
        this.node.position.y,
        this.node.position.z
      )
      this.triggered = true
    }
  }
}
