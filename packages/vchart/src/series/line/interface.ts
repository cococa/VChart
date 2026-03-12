import type { IMarkSpec, IMarkTheme } from '../../typings/spec/common';
import type { ICartesianSeriesSpec } from '../cartesian/interface';
import type { ISymbolMarkSpec, ILineMarkSpec, IAreaMarkSpec } from '../../typings/visual';
import type { IAnimationSpec } from '../../animation/spec';
import type { IDataSamping, IMarkOverlap, IMarkProgressiveConfig } from '../../mark/interface';
import type { SeriesMarkNameEnum } from '../interface/type';
import type { IMultiLabelSpec, ILabelSpec } from '../../component/label/interface';
import type { ILineLikeLabelSpec, ILineLikeSeriesTheme } from '../mixin/interface';
import type { DirectionType } from '../../typings/space';

export interface ILineAnimationParams {
  direction: DirectionType;
}

export type LineAppearPreset = 'clipIn' | 'fadeIn' | 'grow';

type LineMarks = 'point' | 'line' | 'area';

export interface ILineSeriesSpec
  extends ICartesianSeriesSpec,
    IAnimationSpec<LineMarks, LineAppearPreset>,
    IMarkProgressiveConfig,
    IDataSamping,
    IMarkOverlap {
  /** 系列类型 */
  type: 'line';
  /**
   * x轴字段
   */
  xField?: string | string[];
  /**
   * y轴字段
   */
  yField?: string | string[];
  /**
   * 点图元配置
   */
  [SeriesMarkNameEnum.point]?: IMarkSpec<ISymbolMarkSpec>;
  /**
   * 线图元配置
   */
  [SeriesMarkNameEnum.line]?: IMarkSpec<ILineMarkSpec>;
  /**
   * 面积图元配置
   */
  [SeriesMarkNameEnum.area]?: IMarkSpec<IAreaMarkSpec>;
  /**
   * 标签配置
   * @since 1.13.1 新增支持 inside-middle 标签位置
   */
  [SeriesMarkNameEnum.label]?: IMultiLabelSpec<
    Omit<ILineLikeLabelSpec, 'position'> & {
      /**
       * 标签位置，面积图元支持的标签位置
       * */
      position:
        | 'top'
        | 'bottom'
        | 'left'
        | 'right'
        | 'top-right'
        | 'top-left'
        | 'bottom-right'
        | 'bottom-left'
        | 'center'
        | 'inside-middle';
    }
  >;
  /**
   * 折线标签配置
   * @since 1.7.0
   */
  [SeriesMarkNameEnum.lineLabel]?: Omit<ILabelSpec, 'position'> & {
    position?: 'start' | 'end';
  };
  /**
   * 面积图元标签配置
   * @since 1.7.0
   */
  [SeriesMarkNameEnum.areaLabel]?: Omit<ILabelSpec, 'position'> & {
    /**
     * 面积图元标签的位置配置，支持两种位置：
     * - start：面积图元的起点
     * - end：面积图元的终点
     */
    position?: 'start' | 'end';
  };
  /**
   * 系列主 mark 类型配置，该配置会影响图例的展示
   * @default 'line'
   * @since 1.2.0
   */
  seriesMark?: 'line' | 'point' | 'area';

  /**
   * 是否使用额外的 activePoint 显示交互点，可以在点隐藏时显示被交互的点
   * @default false
   * @since 1.3.0
   */
  activePoint?: boolean;

  /**
   * 是否使用连续动画
   */
  useSequentialAnimation?: boolean;
}

export interface ILineSeriesTheme extends ILineLikeSeriesTheme {
  /**
   * 面积图元配置
   */
  [SeriesMarkNameEnum.area]?: Partial<IMarkTheme<IAreaMarkSpec>>;
  /**
   * 面积图元标签配置
   * @since 1.7.0
   */
  [SeriesMarkNameEnum.areaLabel]?: Omit<ILabelSpec, 'position'> & {
    position?: 'start' | 'end';
  };
  /**
   * 系列主 mark 类型配置，该配置会影响图例的展示
   * @default 'line'
   * @since 1.2.0
   */
  seriesMark?: 'line' | 'point' | 'area';
}
