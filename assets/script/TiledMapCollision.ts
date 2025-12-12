import { PHYSICS_GROUP } from './constant'
import {
  _decorator,
  BoxCollider2D,
  Component,
  director,
  Node,
  PolygonCollider2D,
  TiledMap,
  Vec2
} from 'cc'
import { getMaxPolygonVertices } from './calcPolygon'
const { ccclass, property } = _decorator

@ccclass('tiledCollider')
export class tiledCollider extends Component {
  @property
  public collisionLayerName = 'ground' // Tiled中的碰撞层名称
  @property
  public tileSize = new Vec2(70, 70) // 瓦片尺寸（与Tiled一致）
  @property
  public colliderName = 'TiledCollider' // 碰撞体容器名称
  @property(Node)
  public collisionRoot = null // 碰撞体容器节点

  private colliderPoints: Set<String> = new Set() // 碰撞体顶点集合

  onLoad() {
    this.generateCollision()
  }
  generateCollision() {
    if (this.collisionRoot) {
      return false
    }
    const tiledMap = this.node.getComponent(TiledMap)
    this.collisionRoot = new Node(this.colliderName)

    // 2. 获取碰撞层
    const collisionLayer = tiledMap.getLayer(this.collisionLayerName)
    if (!collisionLayer) {
      console.error('未找到碰撞层：', this.collisionLayerName)
      return
    }

    // 3. 遍历碰撞层瓦片生成碰撞体
    const layerSize = collisionLayer.getLayerSize()
    for (let y = 0; y < layerSize.height; y++) {
      for (let x = 0; x < layerSize.width; x++) {
        const tileGid = collisionLayer.getTileGIDAt(x, y)
        if (tileGid <= 0) continue
        // 坐标系转换（Tiled y轴向上 → Cocos y轴向下）
        const worldX = x * this.tileSize.x
        const worldY = (layerSize.height - 1 - y) * this.tileSize.y
        this.colliderPoints.add(`${worldX}, ${worldY}`)
        this.colliderPoints.add(`${worldX + this.tileSize.x}, ${worldY}`)
        this.colliderPoints.add(
          `${worldX + this.tileSize.x}, ${worldY + this.tileSize.y}`
        )
        this.colliderPoints.add(`${worldX}, ${worldY + this.tileSize.y}`)
      }
    }
    this.generateCollider()
  }
  generateCollider() {
    // 根据顶点信息生成多边形，如果一个顶点的前后顶点在同一行或同一列，则跳过该顶点
    const colliderPointsArr: string[] = Array.from(this.colliderPoints).map(
      (item) => item.toString()
    )
    const tempPoints = getMaxPolygonVertices(colliderPointsArr)
    const colliderPoints = tempPoints.map(({ x, y }) => {
      return new Vec2(x, y)
    })
    const collider = this.collisionRoot!.addComponent(PolygonCollider2D)!
    collider.points = colliderPoints
    collider.group = PHYSICS_GROUP.GROUND
    collider.apply()
    this.collisionRoot!.parent = this.node.parent

    console.log('生成碰撞体完成')
  }

  update(deltaTime: number) {}
}
