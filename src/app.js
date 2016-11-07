import './styles/main.css';
import 'c3/c3.css';

import c3 from 'c3';
import weightData from './data/weight-data.json';

(function init() {
  const { timeline } = weightData;
  
  const { 
    dates, 
    weights, 
    weightDiffs, 
    weightDiffSpeeds
  } = processWeightTimeline(timeline);

  generateCharts({ dates, weights, weightDiffs, weightDiffSpeeds});
})();

function processWeightTimeline(timeline) {
  let dates = [];
  let weights = [];
  let weightDiffs = [];
  let weightDiffSpeeds = [];

  let totalDays = 0;
  let totalWeightDiff = 0;
  let averageWeightDiffSpeed = 0; 

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

  return { 
    dates, 
    weights, 
    weightDiffs, 
    weightDiffSpeeds
  };
}

function round100(number) {
  return Math.round(number * 100) / 100;
}

function dayDiff(first, second) {
    return Math.round( (second - first) / (1000 * 60 * 60 * 24) );
}

function generateCharts({ dates, weights, weightDiffs, weightDiffSpeeds}) {
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

  generateWeightChart({ dates, weights, dateAxisConfig });
  generateWeightDiffChart({ dates, weightDiffs, dateAxisConfig});
  generateWeightDiffSpeedChart({ dates, weightDiffSpeeds, dateAxisConfig});
}


function generateWeightChart({ dates, weights, dateAxisConfig }) {
  return c3.generate({
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
}

function generateWeightDiffChart({ dates, weightDiffs, dateAxisConfig}) {
  return c3.generate({
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
}

function generateWeightDiffSpeedChart({ dates, weightDiffSpeeds, dateAxisConfig}) {
  return c3.generate({
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
}