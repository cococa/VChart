import { CartesianChartSpecTransformer } from '../cartesian';
import type { IEffectScatterChartSpec } from './interface';

export class EffectScatterChartSpecTransformer<
  T extends IEffectScatterChartSpec = IEffectScatterChartSpec
> extends CartesianChartSpecTransformer<T> {
  protected _getDefaultSeriesSpec(spec: IEffectScatterChartSpec): any {
    return super._getDefaultSeriesSpec(spec, [
      'point',
      'size',
      'shape',
      'shapeField',
      'sizeField',
      'ripple',
      'rippleSize',
      'ripplePoint'
    ]);
  }
}
