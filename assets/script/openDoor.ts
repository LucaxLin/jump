import {
  _decorator,
  Component,
  director,
  EventKeyboard,
  Input,
  input,
  KeyCode,
  Node
} from 'cc'
import { PlayerControll } from './PlayerController'
const { ccclass, property } = _decorator

@ccclass('openDoor')
export class openDoor extends Component {
  @property(PlayerControll)
  Player: PlayerControll = null
  @property({ tooltip: '跳转场景' })
  sceneName: string = ''
  onLoad() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
  }
  onKeyDown(event: EventKeyboard) {
    switch (event.keyCode) {
      case KeyCode.ARROW_UP: {
        const { x: px } = this.Player.node.getPosition()
        const { x: dx } = this.node.getPosition()
        if (px + 10 >= dx) {
          this.openDoor()
        }
      }
    }
  }
  openDoor() {
    this.node.children.forEach((item) => {
      if (item.name.includes('close')) {
        item.active = false
      } else {
        item.active = true
      }
    })
    if (this.sceneName) {
      director.loadScene(this.sceneName)
    }
  }
  protected onDestroy(): void {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this)
  }
  update(deltaTime: number) {}
}
