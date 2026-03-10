import { isMobile } from 'react-device-detect';
// eslint-disable-next-line no-duplicate-imports
import { default as VChart } from '../../../../src/index';

const data = [
  { city: 'Beijing', x: 116.41, y: 39.9, value: 95, group: 'Tier-1' },
  { city: 'Shanghai', x: 121.47, y: 31.23, value: 98, group: 'Tier-1' },
  { city: 'Guangzhou', x: 113.27, y: 23.13, value: 88, group: 'Tier-1' },
  { city: 'Shenzhen', x: 114.06, y: 22.55, value: 93, group: 'Tier-1' },
  { city: 'Chengdu', x: 104.07, y: 30.67, value: 82, group: 'New Tier-1' },
  { city: 'Hangzhou', x: 120.16, y: 30.25, value: 84, group: 'New Tier-1' },
  { city: 'Wuhan', x: 114.31, y: 30.52, value: 79, group: 'New Tier-1' },
  { city: 'Nanjing', x: 118.8, y: 32.06, value: 77, group: 'New Tier-1' },
  { city: 'XiAn', x: 108.94, y: 34.34, value: 73, group: 'Tier-2' },
  { city: 'Zhengzhou', x: 113.62, y: 34.75, value: 70, group: 'Tier-2' },
  { city: 'Changsha', x: 112.94, y: 28.23, value: 69, group: 'Tier-2' },
  { city: 'Qingdao', x: 120.38, y: 36.07, value: 68, group: 'Tier-2' }
];

const spec = {
  type: 'effectScatter',
  padding: { left: 65, right: 35, top: 50, bottom: 60 },
  title: {
    visible: true,
    text: 'Effect Scatter'
  },
  xField: 'x',
  yField: 'y',
  seriesField: 'group',
  sizeField: 'value',
  size: {
    type: 'linear',
    range: [10, 22]
  },
  ripple: 1,
  rippleSize: datum => datum.value * 0.3,
  animationNormal: {
    ripplePoint: {
      channel: {
        ripple: {
          from: 0,
          to: 1
        }
      },
      duration: 2800,
      loop: true,
      startTime: (_datum, graphic) => {
        const index = graphic?.context?.graphicIndex ?? 0;
        return -((index % 12) / 12) * 2800;
      },
      easing: 'linear'
    }
  },
  ripplePoint: {
    style: {
      fillOpacity: 0.4
    }
  },
  point: {
    style: {
      fillOpacity: 0.95
    }
  },
  data: [
    {
      id: 'effectScatterData',
      values: data
    }
  ],
  axes: [
    {
      orient: 'left',
      type: 'linear',
      title: {
        visible: true,
        text: 'Latitude'
      },
      nice: true,
      grid: {
        visible: true
      }
    },
    {
      orient: 'bottom',
      type: 'linear',
      title: {
        visible: true,
        text: 'Longitude'
      },
      nice: true,
      grid: {
        visible: true
      }
    }
  ],
  legends: {
    visible: true,
    orient: 'top'
  },
  tooltip: {
    mark: {
      content: [
        {
          key: datum => datum.city,
          value: datum => `value: ${datum.value}, group: ${datum.group}`
        }
      ]
    }
  }
};

const run = () => {
  const cs = new VChart(spec, {
    dom: document.getElementById('chart') as HTMLElement,
    mode: isMobile ? 'mobile-browser' : 'desktop-browser'
  });

  console.time('renderTime');
  cs.renderAsync().then(() => {
    console.timeEnd('renderTime');
  });

  window['vchart'] = cs;
  console.log(cs);
};

run();
