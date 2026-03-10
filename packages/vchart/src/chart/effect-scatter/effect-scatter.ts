import { registerEffectScatterSeries } from '../../series/effect-scatter/effect-scatter';
import { SeriesTypeEnum } from '../../series/interface/type';
import { ChartTypeEnum } from '../interface/type';
import type { IEffectScatterChartSpec } from './interface';
import { Factory } from '../../core/factory';
import { EffectScatterChartSpecTransformer } from './effect-scatter-transformer';
import { BaseChart } from '../base';
import { StackChartMixin } from '../stack';
import { mixin } from '@visactor/vutils';
import { registerDimensionHover } from '../../interaction/triggers/dimension-hover';
import { registerDimensionEvents } from '../../event/events';
import { getCartesianDimensionInfo, getDimensionInfoByValue } from '../../event/events/dimension/util/cartesian';
import { getCartesianCrosshairRect } from '../../component/crosshair/utils/cartesian';
import { registerDimensionTooltipProcessor } from '../../component/tooltip/processor/dimension-tooltip';
import { registerMarkTooltipProcessor } from '../../component/tooltip/processor/mark-tooltip';

export class EffectScatterChart<T extends IEffectScatterChartSpec = IEffectScatterChartSpec> extends BaseChart<T> {
  static readonly type: string = ChartTypeEnum.effectScatter;
  static readonly seriesType: string = SeriesTypeEnum.effectScatter;
  static readonly transformerConstructor = EffectScatterChartSpecTransformer;
  // @ts-ignore
  readonly transformerConstructor = EffectScatterChartSpecTransformer;
  readonly type: string = ChartTypeEnum.effectScatter;
  readonly seriesType: string = SeriesTypeEnum.effectScatter;

  protected _setModelOption() {
    this._modelOption.getDimensionInfo = getCartesianDimensionInfo;

    this._modelOption.getDimensionInfoByValue = getDimensionInfoByValue;

    this._modelOption.getRectByDimensionData = getCartesianCrosshairRect;
  }
}

mixin(EffectScatterChart, StackChartMixin);

export const registerEffectScatterChart = () => {
  registerDimensionTooltipProcessor();
  registerMarkTooltipProcessor();
  registerDimensionEvents();
  registerDimensionHover();
  registerEffectScatterSeries();
  Factory.registerChart(EffectScatterChart.type, EffectScatterChart);
};
