/* eslint-disable no-duplicate-imports */
import type { DataView } from '@visactor/vdataset';
import { CartesianSeries } from '../cartesian/cartesian';
import type { SeriesMarkMap } from '../interface';
import { SeriesMarkNameEnum, SeriesTypeEnum } from '../interface/type';
import { LineLikeSeriesMixin } from '../mixin/line-mixin';
import { isArray, mixin } from '@visactor/vutils';
import { valueInScaleRange } from '../../util/scale';
import { AttributeLevel } from '../../constant/attribute';
import { Direction } from '../../typings/space';
import { DEFAULT_SMOOTH_INTERPOLATE } from '../../typings/interpolate';
import { STACK_FIELD_END } from '../../constant/data';
import type { Datum, InterpolateType } from '../../typings';
import { animationConfig, userAnimationConfig } from '../../animation/utils';
import type { ILineSeriesSpec, LineAppearPreset } from './interface';
import type { IStateAnimateSpec } from '../../animation/spec';
import { lineSeriesMark } from './constant';
import { registerAreaMark } from '../../mark/area';
import { registerLineMark } from '../../mark/line';
import { registerSymbolMark } from '../../mark/symbol';
import { Factory } from '../../core/factory';
import type { IAreaMark, IMark } from '../../mark/interface';
import { LineSeriesSpecTransformer } from './line-transformer';
import { getGroupAnimationParams } from '../util/utils';
import { registerCartesianLinearAxis, registerCartesianBandAxis } from '../../component/axis/cartesian';
import { registerSymbolOverlapTransform } from '../../mark/transform/symbol-overlap';
import { registerDataSamplingTransform } from '../../mark/transform/data-sampling';
import { registerAreaSeriesAnimation } from '../area/animation';
import { line } from '../../theme/builtin/common/series/line';

export interface LineSeries<T extends ILineSeriesSpec = ILineSeriesSpec>
  extends Pick<
      LineLikeSeriesMixin,
      | 'initLineMark'
      | 'initSymbolMark'
      | 'initLabelMarkStyle'
      | 'initLineMarkStyle'
      | 'initSymbolMarkStyle'
      | 'encodeDefined'
      | '_lineMark'
      | '_symbolMark'
      | 'addSamplingCompile'
      | 'addOverlapCompile'
      | 'reCompileSampling'
    >,
    CartesianSeries<T> {}

export class LineSeries<T extends ILineSeriesSpec = ILineSeriesSpec> extends CartesianSeries<T> {
  static readonly type: string = SeriesTypeEnum.line;
  type = SeriesTypeEnum.line;

  static readonly mark: SeriesMarkMap = lineSeriesMark;
  static readonly builtInTheme = { line };
  static readonly transformerConstructor = LineSeriesSpecTransformer as any;
  readonly transformerConstructor = LineSeriesSpecTransformer as any;

  protected _sortDataByAxis: boolean = false;
  protected _areaMark?: IAreaMark;

  compile(): void {
    super.compile();
    this.addSamplingCompile();
    this.addOverlapCompile();
  }

  initMark(): void {
    const seriesMark = this._spec.seriesMark ?? 'line';
    if (this._isAreaVisible()) {
      this._areaMark = this._createMark(
        LineSeries.mark.area,
        {
          groupKey: this._seriesField,
          isSeriesMark: seriesMark !== 'point'
        },
        {
          morphElementKey: this.getDimensionField()[0]
        }
      ) as IAreaMark;
    } else {
      this.initLineMark(seriesMark === 'line');
    }
    this.initSymbolMark(seriesMark === 'point');
  }

  protected initTooltip() {
    super.initTooltip();
    const { group, mark } = this._tooltipHelper.activeTriggerSet;
    if (this._areaMark) {
      group.add(this._areaMark);
    }
    if (this._lineMark) {
      group.add(this._lineMark);
    }
    if (this._symbolMark) {
      mark.add(this._symbolMark);
      group.add(this._symbolMark);
    }
  }

  initMarkStyle(): void {
    if (this._areaMark) {
      this.initAreaMarkStyle();
    } else {
      this.initLineMarkStyle(this._direction);
    }
    this.initSymbolMarkStyle();
  }

  initAreaMarkStyle() {
    const userCurveType = (this.getSpec().area?.style?.curveType ?? this.getSpec().line?.style?.curveType) as
      | InterpolateType
      | undefined;
    const curveType =
      userCurveType === DEFAULT_SMOOTH_INTERPOLATE
        ? this._direction === Direction.horizontal
          ? 'monotoneY'
          : 'monotoneX'
        : userCurveType;

    if (this._areaMark) {
      const isAreaVisible = this._isAreaVisible();
      const isLineVisible = this._isLineVisible();
      if (this._direction === Direction.horizontal) {
        this.setMarkStyle(
          this._areaMark,
          {
            x: this.dataToPositionX.bind(this),
            x1: (datum: Datum) => valueInScaleRange(this.dataToPositionX1(datum), this._xAxisHelper?.getScale?.(0)),
            y: this.dataToPositionY.bind(this),
            y1: this.dataToPositionY.bind(this),
            z: this._fieldZ ? this.dataToPositionZ.bind(this) : null,
            orient: this._direction
          },
          'normal',
          AttributeLevel.Series
        );
      } else {
        this.setMarkStyle(
          this._areaMark,
          {
            x: this.dataToPositionX.bind(this),
            x1: this.dataToPositionX.bind(this),
            y1: (datum: Datum) => valueInScaleRange(this.dataToPositionY1(datum), this._yAxisHelper?.getScale?.(0)),
            y: this.dataToPositionY.bind(this),
            z: this._fieldZ ? this.dataToPositionZ.bind(this) : null
          },
          'normal',
          AttributeLevel.Series
        );
      }

      this.setMarkStyle(
        this._areaMark,
        {
          fill: isAreaVisible ? this.getColorAttribute() : false,
          stroke: isLineVisible ? this.getColorAttribute() : false,
          curveType
        },
        'normal',
        AttributeLevel.Series
      );

      if (this._invalidType !== 'zero') {
        this.setMarkStyle(
          this._areaMark,
          {
            defined: this._getInvalidDefined.bind(this),
            connectedType: this._getInvalidConnectType()
          },
          'normal',
          AttributeLevel.Series
        );
      }

      if (this.getStack()) {
        this.setMarkStyle(
          this._areaMark,
          {
            zIndex: (datum: Datum) => -datum[STACK_FIELD_END]
          },
          'normal',
          AttributeLevel.Series
        );
      }

      Object.keys(this._areaMark.stateStyle).forEach(state => {
        if (this._areaMark?.stateStyle[state].stroke) {
          this._areaMark.setPostProcess(
            'stroke',
            result => {
              return [result, false, false, false];
            },
            state
          );
        }
      });
    }
  }

  initAnimation() {
    const lineAnimationParams = { direction: this.direction };
    const appearPreset = (this._spec?.animationAppear as IStateAnimateSpec<LineAppearPreset>)?.preset;
    if (this._lineMark) {
      this._lineMark.setAnimationConfig(
        animationConfig(
          Factory.getAnimationInKey('line')?.(lineAnimationParams, appearPreset),
          userAnimationConfig(SeriesMarkNameEnum.line, this._spec, this._markAttributeContext)
        )
      );
    }

    if (this._areaMark) {
      this._areaMark.setAnimationConfig(
        animationConfig(
          Factory.getAnimationInKey('area')?.(lineAnimationParams, appearPreset),
          userAnimationConfig(SeriesMarkNameEnum.area, this._spec, this._markAttributeContext)
        )
      );
    }

    if (this._symbolMark) {
      const animationParams = getGroupAnimationParams(this);
      this._symbolMark.setAnimationConfig(
        animationConfig(
          Factory.getAnimationInKey('scaleInOut')?.(),
          userAnimationConfig(SeriesMarkNameEnum.point, this._spec, this._markAttributeContext),
          animationParams
        )
      );
    }
  }

  onLayoutEnd(): void {
    super.onLayoutEnd();
    this.reCompileSampling();
  }

  viewDataStatisticsUpdate(d: DataView) {
    super.viewDataStatisticsUpdate(d);
    this._areaMark && this.encodeDefined(this._areaMark, 'defined');
  }

  getSeriesStyle(datum: Datum) {
    const seriesMarkType = this._spec?.seriesMark ?? 'line'; // 加判空防止某些特殊时刻（如 updateSpec 时）鼠标滑过图表导致报错
    return (attribute: string) => {
      if (seriesMarkType === 'line' && attribute === 'fill') {
        attribute = 'stroke';
      }
      const result = this._seriesMark?.getAttribute(attribute as any, datum) ?? undefined;
      if (attribute === 'stroke' && isArray(result)) {
        return result[0];
      }
      return result;
    };
  }

  getDefaultShapeType() {
    return 'circle';
  }

  getActiveMarks(): IMark[] {
    return [this._areaMark, this._lineMark, this._symbolMark].filter(Boolean) as IMark[];
  }

  protected _isAreaVisible() {
    const areaSpec = this._spec.area;
    if (areaSpec?.visible === false || areaSpec?.style?.visible === false) {
      return false;
    }
    if (this._spec.seriesMark === 'area') {
      return true;
    }
    if (!areaSpec) {
      return false;
    }
    return true;
  }

  protected _isLineVisible() {
    const lineSpec = this._spec.line || {};
    return lineSpec.visible !== false && lineSpec.style?.visible !== false;
  }
}

mixin(LineSeries, LineLikeSeriesMixin);

export const registerLineSeries = () => {
  registerDataSamplingTransform();
  registerSymbolOverlapTransform();
  registerAreaMark();
  registerLineMark();
  registerSymbolMark();
  registerAreaSeriesAnimation();
  registerCartesianBandAxis();
  registerCartesianLinearAxis();
  Factory.registerSeries(LineSeries.type, LineSeries);
};
