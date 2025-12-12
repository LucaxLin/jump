/**
 * 坐标点类型定义
 */
interface Point {
  x: number
  y: number
}

/**
 * 解析坐标字符串数组为坐标点数组（适配 '140, 0' 格式）
 * @param {string[]} pointStrArr 坐标字符串数组（如 ['140, 0', '140, 70', '70, 0']）
 * @returns {Point[]} 解析后的坐标点数组
 */
function parsePointStrArr(pointStrArr: string[]): Point[] {
  return pointStrArr.map((str) => {
    // 拆分坐标字符串（处理空格，如 '140, 0' → ['140', '0']）
    const [xStr, yStr] = str.split(',').map((s) => s.trim())
    const x = parseInt(xStr, 10)
    const y = parseInt(yStr, 10)

    // 校验解析结果
    if (isNaN(x) || isNaN(y)) {
      throw new Error(`无效的坐标格式：${str}，请确保格式为 "数字, 数字"`)
    }
    return { x, y }
  })
}

/**
 * 计算两个向量的叉积（判断转向）
 * @param {Point} p0 基准点
 * @param {Point} p1 点1
 * @param {Point} p2 点2
 * @returns {number} 叉积结果：>0 逆时针；<0 顺时针；=0 共线
 */
function crossProduct(p0: Point, p1: Point, p2: Point): number {
  return (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x)
}

/**
 * 计算两点间的距离平方（用于极角相同时排序）
 * @param {Point} p1 点1
 * @param {Point} p2 点2
 * @returns {number} 距离平方
 */
function distanceSq(p1: Point, p2: Point): number {
  return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2
}

/**
 * Graham 扫描法求凸包（逆时针排列）
 * @param {Point[]} points 坐标点数组
 * @returns {Point[]} 逆时针排列的凸包顶点数组（最大简单多边形顶点）
 */
function grahamScan(points: Point[]): Point[] {
  // 去重（避免重复点影响凸包计算）
  const uniquePoints = Array.from(
    new Set(points.map((p) => `${p.x},${p.y}`))
  ).map((str) => {
    const [x, y] = str.split(',').map(Number)
    return { x, y }
  })

  // 少于3个点无法构成多边形，直接返回
  if (uniquePoints.length < 3) return uniquePoints

  // 步骤1：找到基准点（y最小，y相同则x最小）
  let pivot = uniquePoints[0]
  for (const p of uniquePoints) {
    if (p.y < pivot.y || (p.y === pivot.y && p.x < pivot.x)) {
      pivot = p
    }
  }

  // 步骤2：按与基准点的极角从小到大排序（极角相同则按距离从近到远）
  const sortedPoints = uniquePoints.sort((a, b) => {
    const cross = crossProduct(pivot, a, b)
    if (cross !== 0) {
      return -cross // 极角小的排前面（-cross 保证逆时针排序）
    }
    // 极角相同，距离近的排前面
    return distanceSq(pivot, a) - distanceSq(pivot, b)
  })

  // 步骤3：栈维护凸包顶点
  const stack: Point[] = []
  for (const p of sortedPoints) {
    // 若当前点与栈顶两个点构成顺时针/共线，弹出栈顶
    while (
      stack.length >= 2 &&
      crossProduct(stack[stack.length - 2], stack[stack.length - 1], p) <= 0
    ) {
      stack.pop()
    }
    stack.push(p)
  }

  return stack
}

/**
 * 主函数：输入坐标字符串数组，输出逆时针排列的最大多边形顶点
 * @param {string[]} inputArr 输入数组（如 ['140, 0', '140, 70', '70, 0']）
 * @returns {Point[]} 逆时针排列的顶点数组
 */
export function getMaxPolygonVertices(inputArr: string[]): Point[] {
  // 解析坐标点
  const points = parsePointStrArr(inputArr)
  // 求凸包（最大简单多边形）并逆时针排序
  const convexHull = grahamScan(points)
  return convexHull
}

/**
 * 可选：计算多边形面积（验证最大性，逆时针顶点）
 * @param {Point[]} vertices 逆时针顶点数组
 * @returns {number} 多边形面积
 */
function calculatePolygonArea(vertices: Point[]): number {
  let area = 0
  const n = vertices.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y
  }
  return Math.abs(area) / 2
}

