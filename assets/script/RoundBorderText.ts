import {
  _decorator,
  Component,
  Node,
  Graphics,
  Label,
  Vec2,
  Size,
  Vec4,
  math,
  Sprite,
  UITransform
} from 'cc'
const { ccclass, property, executeInEditMode } = _decorator

// 编辑器模式下实时预览效果
@ccclass('RoundBorderText')
@executeInEditMode
export class RoundBorderText extends Component {
  // 样式配置（可在编辑器面板调整）
  @property({ tooltip: '圆角半径' })
  public borderRadius = 6 // 6px
  @property({ tooltip: '边框宽度' })
  public borderWidth = 1 // 1px
  @property({ tooltip: '边框颜色' })
  public borderColor = math.color(0, 0, 0, 255) // 黑色
  @property({ tooltip: '内边距 [上下, 左右]' })
  public padding = new Vec2(4, 16) // 4px 16px
  @property({ type: Label, tooltip: '文本标签' })
  public label: Label = null!
  @property({ type: Sprite, tooltip: '背景绘制组件' })
  public bg: Sprite = null!

  onLoad() {
    this.updateStyle()
  }

  // 编辑器模式下实时更新
  onEnable() {
    if (this.label) {
      this.label.node.on('size-changed', this.updateStyle, this)
    }
  }

  onDisable() {
    if (this.label) {
      this.label.node.off('size-changed', this.updateStyle, this)
    }
  }

  // 核心：更新圆角边框和内边距
  updateStyle() {
    if (!this.bg || !this.label) return

    // 2. 计算容器尺寸（文本尺寸 + 内边距 + 边框宽度）
    const labelSize = this.label.getComponent(UITransform)!.contentSize
    const containerWidth =
      labelSize.width + this.padding.y * 2 + this.borderWidth * 2
    const containerHeight =
      labelSize.height + this.padding.x * 2 + this.borderWidth * 2

    // 3. 设置容器和背景节点尺寸
    this.bg
      .getComponent(UITransform)!
      .setContentSize(
        containerWidth > 90 ? containerWidth : 90,
        containerHeight
      )
    this.node
      .getComponent(UITransform)!
      .setContentSize(
        containerWidth > 90 ? containerWidth : 90,
        containerHeight
      )
  }

  // 对外暴露：设置文本内容
  setText(text: string) {
    this.label.string = text
    this.updateStyle() // 文本变化后更新样式
  }
}
