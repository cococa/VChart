import type { ICartesianSeriesSpec, ICartesianSeriesTheme } from '../cartesian/interface';
import type { IMarkSpec, IMarkTheme } from '../../typings/spec/common';
import type { ISymbolMarkSpec, IVisualSpecBase, ShapeType, FunctionType } from '../../typings';
import type { IRippleMarkSpec } from '../../typings/visual';
import type { IAnimationSpec } from '../../animation/spec';
import type { IMarkProgressiveConfig } from '../../mark/interface';
import type { SeriesMarkNameEnum } from '../interface/type';
import type { ILineLikeLabelSpec } from '../mixin/interface';
import type { IMultiLabelSpec } from '../../component/label/interface';

export type EffectScatterMarks = 'point' | 'label' | 'ripplePoint';

export type EffectScatterAppearPreset = 'scaleIn' | 'fadeIn';

export interface IEffectScatterAnimationParams {
  [key: string]: object;
}

export interface IEffectScatterSeriesSpec
  extends ICartesianSeriesSpec,
    IAnimationSpec<EffectScatterMarks, EffectScatterAppearPreset>,
    IMarkProgressiveConfig {
  /**
   * 系列类型
   */
  type: 'effectScatter';
  /**
   * x轴字段
   */
  xField?: string | string[];
  /**
   * y轴字段
   */
  yField?: string | string[];
  /**
   * 图元配置
   */
  [SeriesMarkNameEnum.point]?: IMarkSpec<ISymbolMarkSpec>;
  /**
   * 尺寸 对应的数据字段。
   */
  sizeField?: string;
  /**
   * 设置尺寸的可选值，支持多种格式：
   * - 单一数值：如 10，则所有点的大小都为 10
   * - 数组：如 [10, 30]，则根据尺寸数据字段映射到该范围
   * - 回调函数，自定义根据数据计算尺寸的逻辑
   * - scale配置，自定义尺寸对应的scale
   */
  size?: number | number[] | FunctionType<number> | IVisualSpecBase<unknown, number>;
  /**
   * 设置形状对应的数据字段
   */
  shapeField?: string;
  /**
   * 形状配置，设置形状的可选值
   * - 单一形状：如 'circle'，则所有点的形状都为 'circle'
   * - 数组：如 ['circle', 'square']，则根据形状数据字段映射到该范围
   * - 回调函数，自定义根据数据计算形状的逻辑
   * - scale配置，自定义形状对应的scale
   */
  shape?: ShapeType | ShapeType[] | FunctionType<ShapeType> | IVisualSpecBase<unknown, ShapeType>;
  /**
   * 标签配置
   */
  [SeriesMarkNameEnum.label]?: IMultiLabelSpec<ILineLikeLabelSpec>;

  /**
   * 波纹图元配置
   */
  [SeriesMarkNameEnum.ripplePoint]?: IMarkSpec<IRippleMarkSpec>;

  /**
   * 波纹密度，取值范围 [0, 1]
   */
  ripple?: number | FunctionType<number>;

  /**
   * 波纹最大半径
   */
  rippleSize?: number | FunctionType<number>;
}

export interface IEffectScatterSeriesTheme extends ICartesianSeriesTheme {
  /**
   * 设置默认的尺寸大小，主题中仅支持单一数值
   */
  size?: number;
  /**
   * 设置默认的形状，主题中仅支持单一形状
   */
  shape?: ShapeType;
  /**
   * 设置点图元的主题样式
   */
  [SeriesMarkNameEnum.point]?: Partial<IMarkTheme<ISymbolMarkSpec>>;

  /**
   * 波纹图元主题样式
   */
  [SeriesMarkNameEnum.ripplePoint]?: Partial<IMarkTheme<IRippleMarkSpec>>;

  /**
   * 波纹密度默认值
   */
  ripple?: number;

  /**
   * 波纹最大半径默认值
   */
  rippleSize?: number;
}
