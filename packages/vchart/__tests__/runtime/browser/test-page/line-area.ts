import { isMobile } from 'react-device-detect';
import type { ILineChartSpec } from '../../../../src/index';
import { default as VChart, registerMediaQuery } from '../../../../src/index';

const data = [
  { month: 'Jan', city: 'Tokyo', value: 32 },
  { month: 'Feb', city: 'Tokyo', value: 28 },
  { month: 'Mar', city: 'Tokyo', value: 35 },
  { month: 'Apr', city: 'Tokyo', value: 30 },
  { month: 'May', city: 'Tokyo', value: 38 },
  { month: 'Jun', city: 'Tokyo', value: 42 },
  { month: 'Jan', city: 'London', value: 22 },
  { month: 'Feb', city: 'London', value: 25 },
  { month: 'Mar', city: 'London', value: 27 },
  { month: 'Apr', city: 'London', value: 31 },
  { month: 'May', city: 'London', value: 29 },
  { month: 'Jun', city: 'London', value: 34 }
];

const spec: ILineChartSpec = {
  type: 'line',
  title: {
    visible: true,
    text: 'Line With Area Rendering'
  },
  data: [
    {
      id: 'lineAreaData',
      values: data
    }
  ],
  xField: 'month',
  yField: 'value',
  seriesField: 'city',
  seriesMark: 'area',
  useSequentialAnimation: true,
  area: {
    visible: true,
    style: {
      fillOpacity: 0.35,
      curveType: 'monotone'
    }
  },
  line: {
    style: {
      lineWidth: 2,
      curveType: 'monotone'
    }
  },
  point: {
    style: {
      size: 6,
      fill: 'red',
      lineWidth: 1
    }
  },
  legends: {
    visible: true,
    orient: 'top'
  },
  axes: [
    {
      orient: 'left',
      type: 'linear',
      nice: true
    },
    {
      orient: 'bottom',
      type: 'band'
    }
  ]
};

const run = () => {
  registerMediaQuery();
  const vchart = new VChart(spec, {
    dom: document.getElementById('chart') as HTMLElement,
    mode: isMobile ? 'mobile-browser' : 'desktop-browser',
    onError: err => {
      console.error(err);
    }
  });

  vchart.renderAsync();
  (window as any).vchart = vchart;
};

run();
