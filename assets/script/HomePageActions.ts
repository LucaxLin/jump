import { _decorator, Component, director, EventTouch, Node } from 'cc'
const { ccclass, property } = _decorator

@ccclass('HomePageActions')
export class HomePageActions extends Component {
  start() {}
  exitGame() {
    window.close()
  }
  goTutorial() {
    director.loadScene('tutorial')
  }
  update(deltaTime: number) {}
}
