import type { Datum } from '../../typings';
import type { IExtensionMarkSpec } from '../../typings/spec/common';
import { isFunction, isNumber, isValid } from '@visactor/vutils';
import { MarkTypeEnum } from '../../mark/interface/type';
import { registerRippleMark } from '../../mark/ripple';
import { Factory } from '../../core/factory';
import type { IAnimationConfig } from '../../animation/interface';
import { SeriesMarkNameEnum, SeriesTypeEnum } from '../interface/type';
import { ScatterSeries, registerScatterSeries } from '../scatter/scatter';
import type { IEffectScatterSeriesSpec } from './interface';
import { effectScatter } from '../../theme/builtin/common/series/effect-scatter';
import { scatter } from '../../theme/builtin/common/series/scatter';

const EFFECT_RIPPLE_MARK_NAME = '__effect_scatter_ripple_mark__';
const DEFAULT_RIPPLE = 1;
const DEFAULT_RIPPLE_SIZE = 24;
const DEFAULT_RIPPLE_DURATION = 2800;

export class EffectScatterSeries extends ScatterSeries {
  static readonly type: string = SeriesTypeEnum.effectScatter;
  type = SeriesTypeEnum.effectScatter;

  static readonly builtInTheme = { scatter, effectScatter };

  setAttrFromSpec() {
    this._appendEffectRippleMark();
    super.setAttrFromSpec();
  }

  private _appendEffectRippleMark() {
    const spec = this._spec as unknown as IEffectScatterSeriesSpec;
    const extensionMarks = spec.extensionMark ? [...spec.extensionMark] : [];
    if (extensionMarks.some(mark => mark?.name === EFFECT_RIPPLE_MARK_NAME)) {
      return;
    }

    const seriesField = spec.seriesField;
    const rippleSpec = spec.ripple;
    const rippleSizeSpec = spec.rippleSize;
    const sizeSpec = spec.size;
    const ripplePointSpec = (spec.ripplePoint ?? {}) as Record<string, any>;
    const ripplePointStyle = ripplePointSpec.style ?? {};
    const defaultRippleSize = isNumber(sizeSpec) ? sizeSpec * 2 : DEFAULT_RIPPLE_SIZE;
    const rippleValue = isNumber(rippleSpec) || isFunction(rippleSpec) ? rippleSpec : DEFAULT_RIPPLE;
    const rippleNormalAnimation =
      ripplePointSpec?.animationNormal?.[MarkTypeEnum.ripple] ??
      ripplePointSpec?.animationNormal?.[SeriesMarkNameEnum.ripplePoint] ??
      (spec as any).animationNormal?.[SeriesMarkNameEnum.ripplePoint] ??
      (spec as any).animationNormal?.[MarkTypeEnum.ripple] ??
      this._getDefaultRippleNormalAnimation(rippleValue);
    const dataId = ripplePointSpec.dataId ?? (spec as any).dataId;
    const dataIndex = ripplePointSpec.dataIndex ?? (spec as any).dataIndex ?? 0;

    const rippleMark: IExtensionMarkSpec<MarkTypeEnum.ripple> = {
      ...ripplePointSpec,
      name: EFFECT_RIPPLE_MARK_NAME,
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

  private _getDefaultRippleNormalAnimation(rippleValue: any): IAnimationConfig {
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
}

export const registerEffectScatterSeries = () => {
  registerScatterSeries();
  registerRippleMark();
  Factory.registerSeries(EffectScatterSeries.type, EffectScatterSeries);
};
