import { CartesianChartSpecTransformer } from '../cartesian';
import { setDefaultCrosshairForCartesianChart } from '../util';
import type { ILineChartSpec } from './interface';

export class LineChartSpecTransformer<T extends ILineChartSpec> extends CartesianChartSpecTransformer<T> {
  protected _getDefaultSeriesSpec(spec: T): any {
    const seriesSpec = super._getDefaultSeriesSpec(spec, [
      'point',
      'line',
      'area',
      'seriesMark',
      'activePoint',
      'sampling',
      'samplingFactor',
      'pointDis',
      'pointDisMul',
      'markOverlap',
      'lineLabel',
      'areaLabel',
      'useSequentialAnimation'
    ]);
    seriesSpec.seriesMark = spec.seriesMark ?? 'line';
    return seriesSpec;
  }
  transformSpec(spec: T): void {
    super.transformSpec(spec);
    setDefaultCrosshairForCartesianChart(spec);
  }
}
