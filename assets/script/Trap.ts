import { _decorator, Component, Node, Vec2 } from 'cc'
const { ccclass, property } = _decorator

@ccclass('Trap')
export class Trap extends Component {
  @property({ tooltip: '陷阱反弹力度' })
  force: Vec2 = new Vec2(-100, 150) // 反弹力度
  start() {}

  update(deltaTime: number) {}
}
