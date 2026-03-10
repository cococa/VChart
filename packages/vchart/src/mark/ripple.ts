import { Factory } from './../core/factory';
import type { IRippleMarkSpec } from '../typings/visual';
import type { IMarkStyle, IRippleMark } from './interface';
// eslint-disable-next-line no-duplicate-imports
import { MarkTypeEnum } from './interface/type';
import { GlyphMark, registerGlyphMark } from './glyph';
import type { Datum } from '../typings/common';
import { createSymbol, type IGlyph, type ISymbolGraphicAttribute } from '@visactor/vrender-core';
import { clamp } from '@visactor/vutils';
import { registerSymbol } from '@visactor/vrender-kits';

export class RippleMark extends GlyphMark<IRippleMarkSpec> implements IRippleMark {
  static readonly type = MarkTypeEnum.ripple;
  readonly type = RippleMark.type;
  private static readonly EXPAND_FACTOR = 1.1;
  private static readonly RING_PHASE_GAP = 0.42;

  protected _getDefaultStyle() {
    const defaultStyle: IMarkStyle<IRippleMarkSpec> = {
      ...super._getDefaultStyle(),
      x: 0,
      y: 0,
      ripple: 0
    };
    return defaultStyle;
  }

  protected _subMarks = {
    ripple0: {
      type: 'symbol',
      defaultAttributes: {
        fillOpacity: 0.75
      }
    },
    ripple1: {
      type: 'symbol',
      defaultAttributes: {
        fillOpacity: 0.5
      }
    },
    ripple2: {
      type: 'symbol',
      defaultAttributes: {
        fillOpacity: 0.25
      }
    }
  };

  protected _positionChannels: string[] = ['ripple', 'size'];

  protected _positionEncoder = (glyphAttrs: any, datum: Datum, g: IGlyph) => {
    const { ripple = (g.attribute as any).ripple, size = (g.attribute as any).size } = glyphAttrs;
    const r = clamp(ripple, 0, 1);
    const rippleSize = size * RippleMark.EXPAND_FACTOR;
    const phase = (offset: number) => {
      return (r + offset) % 1;
    };
    const ringAttrs = (t: number, maxOpacity: number) => {
      // Use a bell-shaped alpha curve so both boundaries (t=0/1) are transparent.
      // This hides the loop reset point and avoids visible stutter/flicker.
      const alpha = 4 * t * (1 - t);
      return {
        size: size + rippleSize * t,
        fillOpacity: maxOpacity * alpha
      };
    };

    return {
      ripple0: ringAttrs(phase(0), 0.75),
      ripple1: ringAttrs(phase(RippleMark.RING_PHASE_GAP), 0.5),
      ripple2: ringAttrs(phase(RippleMark.RING_PHASE_GAP * 2), 0.25)
    };
  };
}

export const registerRippleMark = () => {
  registerGlyphMark();
  registerSymbol();
  Factory.registerMark(RippleMark.type, RippleMark);
  Factory.registerGraphicComponent('symbol', (attrs: ISymbolGraphicAttribute) => createSymbol(attrs));
};
