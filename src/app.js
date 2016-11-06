import './styles/main.css';
import 'c3/c3.css';

import c3 from 'c3';
import weightData from './data/weight-data.json';

const { timeline } = weightData;

let dates = [];
let weights = [];
let weightDiffs = [];
let weightDiffSpeeds = [];

(function processWeightTimeline() {
  timeline.reduce(({ prevWeight, prevDateStr }, item) => {

    const dateStr = item.date;
    dates.push(dateStr);

    const weight = parseFloat(item.weight);
    weights.push(weight);

    const weightDiff = prevWeight 
      ? round100(weight - prevWeight, -2)
      : 0;
    weightDiffs.push(weightDiff);

    const dateDaysDiff = prevDateStr 
      ? dayDiff(new Date(prevDateStr), new Date(dateStr))
      : 0;
    const weightDiffSpeed = dateDaysDiff
      ? round100(weightDiff / dateDaysDiff)
      : 0;

    weightDiffSpeeds.push(weightDiffSpeed);
    
    return {
      prevWeight: weight,
      prevDateStr: dateStr
    }
  }, {});
})();

function round100(number) {
  return Math.round(number * 100) / 100;
}

function dayDiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24));
}

const dateAxisConfig = {
  label: {
    text: 'date',
    position: 'inner-center'
  },
  type: 'timeseries',
  tick: {
    format: '%Y-%m-%d',
    rotate: 45
  }
};

const weightChart = c3.generate({
  bindto: '.weight-chart',
  data: {
    x: 'date',
    y: 'weight',
    columns: [
      ['date', ...dates],
      ['weight', ...weights]
    ],
    types: {
      'weight': 'spline'
    }
  },
  axis: {
    x: dateAxisConfig,
    y: {
      label: {
        text: 'weight [kg]',
        position: 'outer-middle'
      }
    }
  }
});

const weightDiffChart = c3.generate({
  bindto: '.weight-diff-chart',
  data: {
    x: 'date',
    y: 'weight_diff',
    columns: [
      ['date', ...dates],
      ['weight_diff', ...weightDiffs]
    ],
    types: {
      'weight_diff': 'spline'
    }
  },
  axis: {
    x: dateAxisConfig,
    y: {
      label: {
        text: 'weight diff [kg]',
        position: 'outer-middle'
      }
    }
  }
});

const weightDiffSpeedChart = c3.generate({
  bindto: '.weight-diff-speed-chart',
  data: {
    x: 'date',
    y: 'weight_diff_speed',
    columns: [
      ['date', ...dates],
      ['weight_diff_speed', ...weightDiffSpeeds]
    ],
    types: {
      'weight_diff_speed': 'area-step'
    }
  },
  axis: {
    x: dateAxisConfig,
    y: {
      label: {
        text: 'weight diff speed [kg/day]',
        position: 'outer-middle'
      },
      tick: {
        format: d => round100(d)
      }
    }
  }
});