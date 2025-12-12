import {
  _decorator,
  Animation,
  Collider2D,
  Component,
  Contact2DType,
  EventKeyboard,
  Input,
  input,
  PhysicsGroup,
  PhysicsGroup2D,
  RigidBody2D,
  Vec2,
  Vec3
} from 'cc'
const { ccclass, property } = _decorator
import { PHYSICS_GROUP } from './constant'
import { Trap } from './Trap'
@ccclass('PlayerControll')
export class PlayerControll extends Component {
  @property({ tooltip: '移动速度' })
  moveSpeed: number = 300
  @property({ tooltip: '是否面向右（初始朝向）' })
  isFaceRight: boolean = true
  @property({ tooltip: '跳跃速度' })
  jumpSpeed: number = 180
  @property({ tooltip: '跳跃冷却时间（秒）' })
  jumpCD: number = 0.1
  @property({ tooltip: '自动行走' })
  autoMove: boolean = false
  private isGrounded: boolean = true // 是否在地面上
  private isJumpEndTriggered: boolean = false // 防抖标记
  private tempVec2: Vec2 = new Vec2(0, 0)
  private lastJumpTime: number = 0
  private groundVelocityThreshold: number = 0.1 // 接触地面的速度阈值
  private rigidBody: RigidBody2D = null! // 刚体（控制物理移动）
  private animation: Animation = null! // 动画组件
  private collider: Collider2D = null! // 碰撞组件
  private curMoveThreshold: number = 0.001 // 当前移动阈值
  private curMoveDir: number = 0 // 当前移动方向：-1=左，0=静止，1=右
  private allowMove: boolean = true // 是否允许移动
  private isHurt: boolean = false // 受伤状态标记
  onLoad() {
    this.animation = this.getComponent(Animation)
    this.rigidBody = this.getComponent(RigidBody2D)
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this)
    this.collider = this.getComponent(Collider2D)
    if (this.collider) {
      this.collider.on(
        Contact2DType.BEGIN_CONTACT,
        this.onCollisionEnter2D,
        this
      )
    }
    // 碰到WALL，转向继续走
    if (this.autoMove) {
      this.curMoveDir = 1
      this.collider.on(Contact2DType.BEGIN_CONTACT, this.autoMoveHandler, this)
    }
  }
  autoMoveHandler(player: Collider2D, other: Collider2D) {
    if (other.group === PHYSICS_GROUP.WALL) {
      this.curMoveDir *= -1 // 反转移动方向
    }
  }
  /**
   * 键盘按下：记录移动方向
   */
  private onKeyDown(event: EventKeyboard) {
    if (this.autoMove) return
    switch (event.keyCode) {
      case 37: // 左
        this.curMoveDir = -1
        break
      case 39: // 右
        this.curMoveDir = 1
        break
      case 32: // 空格
        this.jump()
    }
  }

  /**
   * 键盘抬起：重置移动方向（仅当对应按键抬起时）
   */
  private onKeyUp(event: EventKeyboard) {
    if (this.autoMove) return
    this.allowMove = true
    switch (event.keyCode) {
      case 37: // 左
        if (this.curMoveDir === -1) this.curMoveDir = -this.curMoveThreshold
        break
      case 39: // 右
        if (this.curMoveDir === 1) this.curMoveDir = this.curMoveThreshold
        break
    }
  }

  jump() {
    const now = Date.now() / 1000 // 转为秒
    // 冷却时间未到则返回
    if (now - this.lastJumpTime < this.jumpCD) return
    if (
      Math.abs(this.rigidBody.linearVelocity.y) <
        this.groundVelocityThreshold &&
      this.isGrounded
    ) {
      this.rigidBody.applyLinearImpulse(
        new Vec2(0, this.jumpSpeed),
        this.rigidBody.getWorldCenter(this.tempVec2),
        true
      )
      this.isGrounded = false // 标记为未在地面上
      this.lastJumpTime = now // 记录最后跳跃时间
    }
  }
  // 碰撞进入地面（跳跃结束）
  onCollisionEnter2D(player: Collider2D, other: Collider2D) {
    if (other.node.name === 'door') {
      this.allowMove = false
    }
    if (other.group === PHYSICS_GROUP.GROUND && !this.isJumpEndTriggered) {
      this.isGrounded = true // 标记为在地面上
      this.isHurt = false
      this.isJumpEndTriggered = true
      // 0.1秒后重置防抖（避免连续碰撞重复触发）
      setTimeout(() => {
        this.isJumpEndTriggered = false
      }, 100)
    } else if (other.group === PHYSICS_GROUP.TRAP) {
      this.handleHitTrap(other.node.getComponent(Trap)!)
    }
  }
  handleHitTrap(trapComponent: Trap) {
    this.isHurt = true
    // 受伤往后弹跳
    // 清除当前速度
    this.rigidBody.linearVelocity = new Vec2(0, 0)
    this.rigidBody.angularVelocity = 0

    // 陷阱碰撞器禁用0.1秒
    trapComponent.getComponent(Collider2D)!.enabled = false
    setTimeout(() => {
      trapComponent.getComponent(Collider2D)!.enabled = true
    }, 100)
    // 施加冲量
    // 先施加向上Y轴冲量，再施加向X轴冲量
    this.rigidBody.applyLinearImpulse(
      new Vec2(0, trapComponent.force.y),
      this.rigidBody.getWorldCenter(this.tempVec2),
      true
    )
    setTimeout(() => {
      this.rigidBody.applyLinearImpulse(
        new Vec2(trapComponent.force.x, 0),
        this.rigidBody.getWorldCenter(this.tempVec2),
        true
      )
    }, 16)
  }

  /**
   * 播放指定动画
   * @param animName 动画名称（对应Animation组件的Clips命名）
   */
  private playAnimation(animName: string) {
    // 如果当前播放的不是指定动画，则播放
    if (this.animation.getState(animName)?.isPlaying) {
      return
    } else {
      this.animation.crossFade(animName, 0.1)
    }
  }
  /**
   * 翻转玩家朝向（左右镜像）
   * @param faceRight 是否面向右
   */
  private flipPlayer(faceRight: boolean) {
    if (this.isFaceRight === faceRight) return
    this.isFaceRight = faceRight
    // 修改缩放实现镜像（X轴缩放取反）
    this.node.setScale(new Vec3(faceRight ? 1 : -1, 1, 1))
  }
  update(deltaTime: number) {
    // 1. 控制物理移动（通过刚体速度，而非直接改位置，保证碰撞正常）
    const velocity = this.rigidBody.linearVelocity
    velocity.x = this.curMoveDir * this.moveSpeed // 仅修改X轴速度（左右）
    velocity.y = this.rigidBody.linearVelocity.y // 保留Y轴速度（重力/跳跃）
    this.rigidBody.linearVelocity = velocity

    // 2. 切换动画：移动时播跑步，静止播站立
    if (this.isHurt) {
      this.playAnimation('player_hurt') // 受伤动画
    } else if (
      Math.abs(this.curMoveDir) > this.curMoveThreshold &&
      this.isGrounded
    ) {
      this.playAnimation('player_walk') // 跑步动画
    } else if (!this.isGrounded) {
      this.playAnimation('player_jump') // 跳跃动画
    } else {
      this.playAnimation('player_stand') // 站立动画
    }
    this.flipPlayer(
      Math.abs(this.curMoveDir) > this.curMoveThreshold
        ? this.curMoveDir > 0
        : this.isFaceRight
    )
    // 3. 移动玩家
    if (!this.isHurt) {
      if (Math.abs(this.curMoveDir) > this.curMoveThreshold && this.allowMove) {
        this.node.setPosition(
          this.node.position.add3f(
            this.curMoveDir * this.moveSpeed * deltaTime,
            0,
            0
          )
        )
      }
    }
  }
  onDestroy() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this)
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this)
    if (this.collider) {
      this.collider.off(
        Contact2DType.BEGIN_CONTACT,
        this.onCollisionEnter2D,
        this
      )
    }
  }
}
