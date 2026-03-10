import type { IEffectScatterSeriesSpec } from '../../series/effect-scatter/interface';
import type { IChartExtendsSeriesSpec } from '../../typings/spec';
import type { ICartesianChartSpec } from '../cartesian/interface';

export interface IEffectScatterChartSpec
  extends ICartesianChartSpec,
    IChartExtendsSeriesSpec<IEffectScatterSeriesSpec> {
  type: 'effectScatter';
  /** 系列配置 */
  series?: IEffectScatterSeriesSpec[];
}
