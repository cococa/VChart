import { isValid } from '@visactor/vutils';
import type { IChartSpecInfo } from '../../chart/interface';
import { SeriesMarkNameEnum } from '../interface';
import { LineLikeSeriesSpecTransformer } from '../mixin/line-mixin-transformer';
import type { ConvertToMarkStyleSpec, IAreaMarkSpec } from '../../typings';
import { mergeSpec } from '@visactor/vutils-extension';
import type { LineSeries } from './line';
import type { ILineSeriesSpec, ILineSeriesTheme } from './interface';

export class LineSeriesSpecTransformer<
  T extends ILineSeriesSpec = ILineSeriesSpec,
  K extends ILineSeriesTheme = ILineSeriesTheme
> extends LineLikeSeriesSpecTransformer<T, K> {
  protected _transformLabelSpec(spec: T): void {
    const isAreaVisible = this._isAreaVisible(spec);
    const isPointVisible = spec.point?.visible !== false && spec.point?.style?.visible !== false;

    this._addMarkLabelSpec(spec, (spec: any) => {
      const isAreaMiddle = spec.position === 'inside-middle';
      if (isAreaMiddle && isAreaVisible) {
        return SeriesMarkNameEnum.area;
      }
      if (isPointVisible) {
        return SeriesMarkNameEnum.point;
      }
      return isAreaVisible ? SeriesMarkNameEnum.area : SeriesMarkNameEnum.line;
    });

    this._addMarkLabelSpec<LineSeries>(
      spec,
      SeriesMarkNameEnum.line,
      'lineLabel' as any,
      'initLineLabelMarkStyle' as any,
      undefined,
      true
    );

    this._addMarkLabelSpec<LineSeries>(
      spec,
      SeriesMarkNameEnum.area,
      'areaLabel' as any,
      'initLineLabelMarkStyle' as any,
      undefined,
      true
    );
  }

  protected _transformSpecAfterMergingTheme(spec: T, chartSpec: any, chartSpecInfo?: IChartSpecInfo) {
    super._transformSpecAfterMergingTheme(spec, chartSpec, chartSpecInfo);

    if (!this._isAreaVisible(spec)) {
      return;
    }

    const area = spec.area ?? {};
    const line = spec.line ?? {};
    const { seriesMark } = spec;
    const isAreaVisible = area.visible !== false && area.style?.visible !== false;
    const isLineVisible = line.visible !== false && line.style?.visible !== false;

    area.support3d = !!(area.support3d || line.support3d);
    area.zIndex =
      isValid(area.zIndex) || isValid(line.zIndex) ? Math.max(area.zIndex ?? 0, line.zIndex ?? 0) : undefined;

    if (area.style) {
      delete area.style.stroke;
    }
    if (area.state) {
      Object.keys(area.state).forEach(state => {
        if ('style' in area.state[state]) {
          delete area.state[state].style.stroke;
        } else {
          delete (<ConvertToMarkStyleSpec<IAreaMarkSpec>>area.state[state]).stroke;
        }
      });
    }

    let mainSpec = area;
    let subSpec = line;
    if (seriesMark === 'line' || (isLineVisible && !isAreaVisible)) {
      mainSpec = line;
      subSpec = area;
    }
    area.style = mergeSpec({}, subSpec.style, mainSpec.style);
    area.state = mergeSpec({}, subSpec.state, mainSpec.state);

    if (area.interactive === false) {
      area.style.fillPickable = false;
    }
    if (line.interactive === false) {
      line.style.strokePickable = false;
    }

    area.interactive = !!(area.interactive || (line.interactive ?? true));

    spec.area = area as any;
    spec.line = line as any;
  }

  private _isAreaVisible(spec: T): boolean {
    if (spec.area?.visible === false || spec.area?.style?.visible === false) {
      return false;
    }
    if (spec.seriesMark === 'area') {
      return true;
    }
    if (!spec.area) {
      return false;
    }
    return true;
  }
}
