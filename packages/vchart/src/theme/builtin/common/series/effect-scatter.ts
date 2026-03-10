import type { IEffectScatterSeriesTheme } from '../../../../series/effect-scatter/interface';

export const effectScatter: IEffectScatterSeriesTheme = {
  point: {
    style: {
      size: 8,
      symbolType: 'circle',
      lineWidth: 0,
      fillOpacity: 0.9
    }
  },
  label: {
    visible: false,
    offset: 5,
    position: 'top',
    style: {
      lineWidth: 2,
      stroke: { type: 'palette', key: 'backgroundColor' }
    }
  },
  ripple: 1,
  rippleSize: 24
};
