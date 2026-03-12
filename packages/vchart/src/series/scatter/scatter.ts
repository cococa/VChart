/* eslint-disable no-duplicate-imports */
import { PREFIX } from '../../constant/base';
import type { DataView } from '@visactor/vdataset';
import type { Datum, ScaleType, VisualType, IScatterInvalidType } from '../../typings';
import type { IExtensionMarkSpec } from '../../typings/spec/common';
import type { IScatterSeriesSpec, ScatterAppearPreset } from './interface';
import { CartesianSeries } from '../cartesian/cartesian';
import { isNil, isValid, isObject, isFunction, isString, isArray, isNumber, isNumeric } from '@visactor/vutils';
import { AttributeLevel } from '../../constant/attribute';
import type { SeriesMarkMap } from '../interface';
import { SeriesMarkNameEnum, SeriesTypeEnum } from '../interface/type';
import { STATE_VALUE_ENUM } from '../../compile/mark/interface';
import { MarkTypeEnum } from '../../mark/interface/type';
import {
  SCATTER_DEFAULT_RANGE_SHAPE,
  SCATTER_DEFAULT_RANGE_SIZE,
  SCATTER_DEFAULT_SHAPE,
  SCATTER_DEFAULT_SHAPE_SCALE_TYPE,
  SCATTER_DEFAULT_SIZE,
  SCATTER_DEFAULT_SIZE_SCALE_TYPE
} from '../../constant/scatter';
import { animationConfig, shouldMarkDoMorph, userAnimationConfig } from '../../animation/utils';
import type { IStateAnimateSpec } from '../../animation/spec';
import { registerScatterAnimation } from './animation';
import { registerRippleMark } from '../../mark/ripple';
import { registerSymbolMark } from '../../mark/symbol';
import { scatterSeriesMark } from './constant';
import { Factory } from '../../core/factory';
import type { ILabelMark, IMark, IMarkGraphic, ISymbolMark } from '../../mark/interface';
import { ScatterSeriesSpecTransformer } from './scatter-transformer';
import { getGroupAnimationParams } from '../util/utils';
import { registerCartesianLinearAxis, registerCartesianBandAxis } from '../../component/axis/cartesian';
import { scatter } from '../../theme/builtin/common/series/scatter';

const SCATTER_RIPPLE_MARK_NAME = '__scatter_ripple_mark__';
const DEFAULT_RIPPLE = 1;
const DEFAULT_RIPPLE_SIZE = 24;
const DEFAULT_RIPPLE_DURATION = 2800;

export class ScatterSeries<T extends IScatterSeriesSpec = IScatterSeriesSpec> extends CartesianSeries<T> {
  static readonly type: string = SeriesTypeEnum.scatter;
  type = SeriesTypeEnum.scatter;

  static readonly mark: SeriesMarkMap = scatterSeriesMark;
  static readonly builtInTheme = { scatter };
  static readonly transformerConstructor = ScatterSeriesSpecTransformer as any;
  readonly transformerConstructor = ScatterSeriesSpecTransformer;

  private _symbolMark: ISymbolMark;
  private _labelMark: ILabelMark;

  private _size: IScatterSeriesSpec['size'];
  private _sizeField: string;
  private _shape: IScatterSeriesSpec['shape'];
  private _shapeField: string;

  protected _invalidType: IScatterInvalidType = 'zero';

  setAttrFromSpec() {
    this._appendScatterRippleMark();
    super.setAttrFromSpec();

    // size
    this._size = this._spec.size;
    this._sizeField = this._spec.sizeField;
    // shape
    this._shape = this._spec.shape;
    this._shapeField = this._spec.shapeField;
  }

  private _appendScatterRippleMark() {
    if (this.type !== SeriesTypeEnum.scatter) {
      return;
    }

    const spec = this._spec as unknown as IScatterSeriesSpec;
    const rippleConfig = isObject(spec.ripple) ? (spec.ripple as Record<string, any>) : null;
    if (!rippleConfig) {
      return;
    }

    // Ripple object mode defaults to hidden unless explicitly enabled.
    if (rippleConfig && rippleConfig.show !== true) {
      return;
    }

    const extensionMarks = spec.extensionMark ? [...spec.extensionMark] : [];
    if (extensionMarks.some(mark => mark?.name === SCATTER_RIPPLE_MARK_NAME)) {
      return;
    }

    const ripplePointSpec = (rippleConfig.point ?? {}) as Record<string, any>;
    const rippleValueSpec = rippleConfig.value;
    if (isNumber(rippleValueSpec) && rippleValueSpec <= 0) {
      return;
    }

    const seriesField = spec.seriesField;
    const rippleSizeSpec = rippleConfig.size;
    const sizeSpec = spec.size;
    const ripplePointStyle = ripplePointSpec.style ?? {};
    const defaultRippleSize = isNumber(sizeSpec) ? sizeSpec * 2 : DEFAULT_RIPPLE_SIZE;
    const rippleValue = isNumber(rippleValueSpec) || isFunction(rippleValueSpec) ? rippleValueSpec : DEFAULT_RIPPLE;
    const rippleNormalAnimation =
      ripplePointSpec?.animationNormal?.[MarkTypeEnum.ripple] ??
      ripplePointSpec?.animationNormal?.[SeriesMarkNameEnum.ripplePoint] ??
      this._getDefaultRippleNormalAnimation(rippleValue);
    const dataId = ripplePointSpec.dataId ?? (spec as any).dataId;
    const dataIndex = ripplePointSpec.dataIndex ?? (spec as any).dataIndex ?? 0;

    const rippleMark: IExtensionMarkSpec<MarkTypeEnum.ripple> = {
      ...ripplePointSpec,
      name: SCATTER_RIPPLE_MARK_NAME,
      type: MarkTypeEnum.ripple,
      dataId,
      dataIndex,
      interactive: false,
      animation: ripplePointSpec.animation ?? true,
      animationNormal: {
        ...(ripplePointSpec.animationNormal ?? {}),
        [MarkTypeEnum.ripple]: rippleNormalAnimation
      },
      zIndex: ripplePointSpec.zIndex ?? 0,
      style: {
        x: (datum: Datum) => this.dataToPositionX(datum),
        y: (datum: Datum) => this.dataToPositionY(datum),
        size: isNumber(rippleSizeSpec) || isFunction(rippleSizeSpec) ? rippleSizeSpec : defaultRippleSize,
        ripple: rippleValue,
        fill: (datum: Datum, ctx: any) => {
          if (seriesField && isValid(datum?.[seriesField]) && isFunction(ctx?.seriesColor)) {
            return ctx.seriesColor(datum[seriesField]);
          }
          if (isFunction(ctx?.seriesColor)) {
            return ctx.seriesColor();
          }
          return undefined;
        },
        fillOpacity: 0.55,
        ...ripplePointStyle
      }
    };

    extensionMarks.unshift(rippleMark);
    spec.extensionMark = extensionMarks;
  }

  private _getDefaultRippleNormalAnimation(rippleValue: any) {
    return {
      channel: {
        ripple: {
          from: 0,
          to: rippleValue
        }
      },
      duration: DEFAULT_RIPPLE_DURATION,
      startTime: (_datum: Datum, graphic: any) => {
        const index = graphic?.context?.graphicIndex ?? 0;
        const phase = (index % 12) / 12;
        return -phase * DEFAULT_RIPPLE_DURATION;
      },
      easing: 'linear',
      loop: true
    };
  }

  private _getSeriesAttribute<T>(
    field: string,
    spec: VisualType<T>,
    {
      defaultScaleType,
      defaultRange
    }: {
      defaultScaleType: ScaleType;
      defaultRange: T[];
    },
    key: string
  ): VisualType<T> {
    // 若sizeSpec是函数
    if (isFunction(spec)) {
      return spec;
    }

    if (isArray(spec)) {
      if (isNil(field)) {
        this._option?.onError(`${key}Field is required.`);
        return spec;
      }

      if (defaultScaleType !== 'ordinal' && (spec as any[]).length > 2) {
        this._option?.onError(`${key} length is invalid, specify up to 2 ${key}s.`);
        return spec;
      }
      const scaleName = `${PREFIX}_series_scatter_${this.id}_scale_${key}`;
      this._option.globalScale.registerModelScale({
        id: scaleName,
        type: defaultScaleType,
        domain: [
          {
            dataId: this._rawData.name,
            fields: [field]
          }
        ],
        range: spec
      });
      return {
        scale: scaleName,
        field
      };
    }

    // 若sizeSpec是对象
    if (isObject(spec)) {
      if (isNil(field)) {
        this._option?.onError(`${key}Field is required.`);
        return spec;
      }
      const scaleName = `${PREFIX}_series_scatter_${this.id}_scale_${key}`;
      const visualSpec = {
        id: scaleName,
        type: defaultScaleType,
        domain: [
          {
            dataId: this._rawData.name,
            fields: [field]
          }
        ],
        range: defaultRange,
        ...spec
      };

      this._option.globalScale.registerModelScale(visualSpec);
      return {
        scale: visualSpec.id,
        field
      };
    }

    // 其余情况报错
    this._option?.onError(`${key} attribute is invalid.`);
    return spec;
  }

  /**
   * 计算sizeScale
   * @param field 数据对应字段
   * @param sizeSpec size配置
   */
  private getSizeAttribute(field: string, sizeSpec: IScatterSeriesSpec['size']): VisualType<number> {
    // 若sizeSpec不存在
    if (isNil(sizeSpec)) {
      // Tips: spec会被theme配置merge, 所以Spec没配置, 不一定会触发这里.
      return SCATTER_DEFAULT_SIZE;
    }

    // 若sizeSpec是数值
    if (isNumber(sizeSpec)) {
      return sizeSpec;
    }

    // 若sizeSpec是字符串中的数值
    if (isString(sizeSpec) && isNumeric(sizeSpec)) {
      return parseFloat(sizeSpec);
    }

    return this._getSeriesAttribute<number>(
      field,
      sizeSpec as VisualType<number>,
      {
        defaultScaleType: SCATTER_DEFAULT_SIZE_SCALE_TYPE,
        defaultRange: SCATTER_DEFAULT_RANGE_SIZE
      },
      'size'
    );
  }

  /**
   * 计算shapeScale
   * @param field 数据对应字段
   * @param shapeSpec shape配置
   */
  private getShapeAttribute(field: string, shapeSpec: IScatterSeriesSpec['shape']): VisualType<string> {
    // 若shapeSpec不存在
    if (isNil(shapeSpec)) {
      // Tips: spec会被theme配置merge, 所以Spec没配置, 不一定会触发这里.
      return SCATTER_DEFAULT_SHAPE;
    }

    // 若shapeSpec是字符串
    if (isString(shapeSpec)) {
      return shapeSpec;
    }

    return this._getSeriesAttribute<string>(
      field,
      shapeSpec as VisualType<string>,
      {
        defaultScaleType: SCATTER_DEFAULT_SHAPE_SCALE_TYPE,
        defaultRange: SCATTER_DEFAULT_RANGE_SHAPE
      },
      'shape'
    );
  }

  /**
   * 初始化Mark
   */
  initMark(): void {
    this._symbolMark = this._createMark(
      ScatterSeries.mark.point,
      {
        groupKey: this._seriesField,
        isSeriesMark: true
      },
      {
        morph: shouldMarkDoMorph(this._spec, ScatterSeries.mark.point.name),
        morphElementKey: this.getDimensionField()[0]
      }
    ) as ISymbolMark;
  }

  /**
   * 初始化散点图各类Mark的Style
   */
  initMarkStyle(): void {
    this.initSymbolMarkStyle();
  }

  /**
   * 初始化动画
   */
  initAnimation(): void {
    const animationParams = getGroupAnimationParams(this);
    const appearPreset = (this._spec?.animationAppear as IStateAnimateSpec<ScatterAppearPreset>)?.preset;
    this._symbolMark.setAnimationConfig(
      animationConfig(
        Factory.getAnimationInKey('scatter')?.({}, appearPreset),
        userAnimationConfig(SeriesMarkNameEnum.point, this._spec, this._markAttributeContext),
        animationParams
      )
    );
  }

  /**
   * 初始化SymbolMark
   */
  private initSymbolMarkStyle(): void {
    const symbolMark = this._symbolMark;
    if (!symbolMark) {
      return;
    }

    if (this._invalidType !== 'zero') {
      this.setMarkStyle(symbolMark, {
        visible: this._getInvalidDefined.bind(this)
      });
    }

    this.setMarkStyle(
      symbolMark,
      {
        x: this.dataToPositionX.bind(this),
        y: this.dataToPositionY.bind(this),
        z: this._fieldZ ? this.dataToPositionZ.bind(this) : null,
        fill: this.getColorAttribute(),
        size: isNumber(this._size) || isFunction(this._size) ? this._size : SCATTER_DEFAULT_SIZE,
        symbolType: isString(this._shape) || isFunction(this._shape) ? this._shape : SCATTER_DEFAULT_SHAPE
      },
      STATE_VALUE_ENUM.STATE_NORMAL,
      AttributeLevel.Series
    );

    if (isValid(this._sizeField) || isValid(this._size)) {
      this.setMarkStyle(
        symbolMark,
        {
          size: this.getSizeAttribute(this._sizeField, this._size) as VisualType<number>
        },
        STATE_VALUE_ENUM.STATE_NORMAL,
        AttributeLevel.User_Mark
      );
    }

    if (isValid(this._shapeField) || isValid(this._shape)) {
      this.setMarkStyle(
        symbolMark,
        {
          symbolType: this.getShapeAttribute(this._shapeField, this._shape) as VisualType<string>
        },
        STATE_VALUE_ENUM.STATE_NORMAL,
        AttributeLevel.User_Mark
      );
    }
  }

  protected initTooltip() {
    super.initTooltip();

    this._symbolMark && this._tooltipHelper.activeTriggerSet.mark.add(this._symbolMark);
  }

  viewDataStatisticsUpdate(d: DataView) {
    super.viewDataStatisticsUpdate(d);
    const fields = [this.getDimensionField()[0], this.getStackValueField()];
    const allValid = fields.every(field => field && this.getViewDataStatistics()?.latestData?.[field]?.allValid);
    if (this._invalidType === 'zero' || allValid) {
      this.setMarkStyle(this._symbolMark, { visible: true }, 'normal', AttributeLevel.Series);
    } else {
      this.setMarkStyle(
        this._symbolMark,
        { visible: this._getInvalidDefined.bind(this) },
        'normal',
        AttributeLevel.Series
      );
    }

    // if has produce, reCompile encode to set attribute to product
    if (this._symbolMark.getProduct()) {
      this._symbolMark.compileEncode();
    }
  }

  /**
   * 初始化LabelMark
   */
  initLabelMarkStyle(labelMark?: ILabelMark): void {
    if (!labelMark) {
      return;
    }
    this._labelMark = labelMark;
    this.setMarkStyle(
      labelMark,
      {
        fill: this.getColorAttribute(),
        text: (datum: Datum) => {
          return datum[this.getStackValueField()];
        },
        z: this._fieldZ ? this.dataToPositionZ.bind(this) : null
      },
      STATE_VALUE_ENUM.STATE_NORMAL,
      AttributeLevel.Series
    );
    if (this._invalidType !== 'zero') {
      this.setMarkStyle(
        labelMark,
        {
          visible: this._getInvalidDefined.bind(this)
        },
        STATE_VALUE_ENUM.STATE_NORMAL,
        AttributeLevel.Series
      );
    }
  }

  /**
   * 处理缩放
   */
  handleZoom(e: any) {
    this.getMarksWithoutRoot().forEach(mark => {
      if (!mark) {
        return;
      }
      const graphics = mark.getGraphics();

      if (!graphics || !graphics.length) {
        return;
      }

      graphics.forEach((graphicItem: IMarkGraphic, i: number) => {
        const datum = graphicItem?.context?.data?.[0];
        const newPosition = this.dataToPosition(datum);
        if (newPosition && graphicItem) {
          graphicItem.translateTo(newPosition.x, newPosition.y);
        }
      });
    });

    const vgrammarLabel = this._labelMark?.getComponent()?.getProduct();

    if (vgrammarLabel) {
      (vgrammarLabel as any).evaluate(null, null);
    }
  }

  handlePan(e: any) {
    // TODO 现在处理好像一模一样
    this.handleZoom(e);
  }

  getDefaultShapeType() {
    return 'circle';
  }

  getActiveMarks(): IMark[] {
    return [this._symbolMark];
  }
}

export const registerScatterSeries = () => {
  registerSymbolMark();
  registerRippleMark();
  registerScatterAnimation();
  registerCartesianBandAxis();
  registerCartesianLinearAxis();
  Factory.registerSeries(ScatterSeries.type, ScatterSeries);
};
