import { BaseSeriesSpecTransformer } from '../base';
import { SeriesMarkNameEnum } from '../interface';
import type { IEffectScatterSeriesSpec, IEffectScatterSeriesTheme } from './interface';

export class EffectScatterSeriesSpecTransformer<
  T extends IEffectScatterSeriesSpec = IEffectScatterSeriesSpec,
  K extends IEffectScatterSeriesTheme = IEffectScatterSeriesTheme
> extends BaseSeriesSpecTransformer<T, K> {
  protected _transformLabelSpec(spec: T): void {
    this._addMarkLabelSpec(spec, SeriesMarkNameEnum.point);
  }
}
