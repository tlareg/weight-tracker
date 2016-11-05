import './styles/main.css';
import 'c3/c3.css';

import c3 from 'c3';
import weightData from './data/weight-data.json';

const { timeline } = weightData; 

const chart = c3.generate({
  bindto: '#chart',
  data: {
    x: 'date',
    columns: [
      ['date', ...timeline.map(i => i.date)],
      ['weight', ...timeline.map(i => parseFloat(i.weight))]
    ],
    types: {
      'weight': 'spline'
    }
  },
  axis: {
    x: {
      type: 'timeseries',
      tick: {
        format: '%Y-%m-%d',
        rotate: 45
      }
    }
  }
});