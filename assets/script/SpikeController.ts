import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SpikeController')
export class SpikeController extends Component {
    @property(Node)
    player: Node = null;
    start() {

    }

    update(deltaTime: number) {
        
    }
}


