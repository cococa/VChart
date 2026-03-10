# EffectScatter 配置说明

本文档基于如下示例配置，说明哪些参数是 `effectScatter` 独有，哪些是与普通 `scatter` 或笛卡尔图共享的通用参数。

## effectScatter 独有参数

以下参数是 `effectScatter` 相对普通 `scatter` 新增/扩展的关键能力：

1. `type: 'effectScatter'`
- 指定图表类型为特效散点图。

2. `ripple`
- 涟漪推进值（可理解为涟漪阶段值，范围通常在 `[0, 1]`）。
- 支持常量或函数：`number | (datum => number)`。

3. `rippleSize`
- 涟漪扩散范围（最大半径相关）。
- 支持常量或函数：`number | (datum => number)`。

4. `ripplePoint`
- 涟漪图元样式配置（mark 级别），例如：
  - `ripplePoint.style.fillOpacity`
- 用于单独控制涟漪层，不影响中心散点 `point`。

5. `animationNormal.ripplePoint`
- 把循环动画直接作用在涟漪图元上。
- 你示例中的：
  - `channel.ripple.from/to`
  - `duration`
  - `loop`
  - `startTime`
  - `easing`

## 你这段配置里的通用参数（非 effectScatter 独有）

这些参数在普通散点图或笛卡尔图中同样常见：

- 布局与组件：`padding`, `title`, `axes`, `legends`, `tooltip`, `data`
- 维度映射：`xField`, `yField`, `seriesField`, `sizeField`, `size`
- 点图元样式：`point.style.*`

## 快速判定规则

当你需要区分“是不是 effectScatter 专属能力”时，可按下面判断：

- 只与涟漪层相关：通常是 effectScatter 专属（如 `ripple*`, `ripplePoint`, `animationNormal.ripplePoint`）
- 只与散点基础编码相关：通常是 scatter 共享（如 `xField`, `yField`, `size`, `point`）

## 对应到你给的配置（摘要）

effectScatter 专属：
- `type: 'effectScatter'`
- `ripple`
- `rippleSize`
- `ripplePoint`
- `animationNormal.ripplePoint`

通用配置：
- `padding`, `title`, `xField`, `yField`, `seriesField`, `sizeField`, `size`
- `point`, `data`, `axes`, `legends`, `tooltip`
