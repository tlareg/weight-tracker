import "./styles/main.css";
import "c3/c3.css";

import c3 from "c3";
import weightData from "./data/weight-data.json";

const averageStepInput = document.querySelector(".average-step-input");
const dateFromInput = document.querySelector(".date-from-input");
const dateToInput = document.querySelector(".date-to-input");
const refreshBtn = document.querySelector(".refresh-btn");

refreshBtn.addEventListener("click", () => {
  const averageStep =
    (averageStepInput.value && parseInt(averageStepInput.value, 10)) || 1;
  const dateFrom = dateFromInput.value;
  const dateTo = dateToInput.value;

  refresh({
    weightData,
    averageStep,
    dateFrom,
    dateTo,
  });
});

refresh({
  weightData,
  averageStep: 1,
});

function refresh({ weightData, averageStep, dateFrom, dateTo }) {
  const { timeline } = weightData;

  const from = dateFrom && new Date(dateFrom).getTime();
  const to = dateTo && new Date(dateTo).getTime();

  const parsedTimeline = timeline.map((item) =>
    Object.assign({}, item, { timestamp: new Date(item.date).getTime() })
  );

  const timelineInDateRange = parsedTimeline.filter(
    ({ timestamp: current }) =>
      (from ? from <= current : true) && (to ? current <= to : true)
  );

  const averageTimeline = createAverageTimeline(
    timelineInDateRange,
    averageStep
  );

  const {
    dates,
    weights,
    weightDiffs,
    weightDiffSpeeds,
  } = processWeightTimeline(averageTimeline);

  generateCharts({
    dates,
    weights,
    weightDiffs,
    weightDiffSpeeds,
  });
}

function createAverageTimeline(originTimeline, averageStep) {
  return originTimeline.reduce(
    ({ newTimeline, averageItems }, item, index) => {
      const firstItemOfAverage = averageItems[0];
      if (!firstItemOfAverage) {
        return { newTimeline, averageItems: [item] };
      }

      const isLastItem = index === originTimeline.length - 1;

      const dateDaysDiff = dayDiff(
        firstItemOfAverage.timestamp,
        item.timestamp
      );

      if (dateDaysDiff < averageStep) {
        averageItems.push(item);
        if (!isLastItem) {
          return { newTimeline, averageItems };
        }
        newTimeline.push(createAverageWeightItem(averageItems));
        return { newTimeline };
      }

      newTimeline.push(createAverageWeightItem(averageItems));
      if (isLastItem) {
        newTimeline.push(item);
      }
      return {
        newTimeline,
        averageItems: [item],
      };
    },
    { newTimeline: [], averageItems: [] }
  ).newTimeline;
}

function createAverageWeightItem(items) {
  const sum = items.reduce((acc, item) => acc + parseFloat(item.weight), 0);
  const averageWeight = round100(sum / items.length);
  const lastItem = items[items.length -1];
  return {
    date: lastItem.date,
    timestamp: lastItem.timestamp,
    weight: "" + averageWeight,
  };
}

function processWeightTimeline(timeline) {
  let dates = [];
  let weights = [];
  let weightDiffs = [];
  let weightDiffSpeeds = [];

  timeline.reduce(({ prevWeight, prevTimestamp }, item) => {
    const { date: dateStr, timestamp } = item;
    dates.push(dateStr);

    const weight = parseFloat(item.weight);
    weights.push(weight);

    const weightDiff = prevWeight ? round100(weight - prevWeight, -2) : 0;
    weightDiffs.push(weightDiff);

    const dateDaysDiff = prevTimestamp ? dayDiff(prevTimestamp, timestamp) : 0;
    const weightDiffSpeed = dateDaysDiff
      ? round100(weightDiff / dateDaysDiff)
      : 0;
    weightDiffSpeeds.push(weightDiffSpeed);

    return {
      prevWeight: weight,
      prevTimestamp: timestamp,
    };
  }, {});

  return {
    dates,
    weights,
    weightDiffs,
    weightDiffSpeeds,
  };
}

function round100(number) {
  return Math.round(number * 100) / 100;
}

function dayDiff(firstTime, secondTime) {
  return Math.round((secondTime - firstTime) / (1000 * 60 * 60 * 24));
}

function generateCharts({ dates, weights, weightDiffs, weightDiffSpeeds }) {
  const dateAxisConfig = {
    label: {
      text: "date",
      position: "inner-center",
    },
    type: "timeseries",
    tick: {
      format: "%Y-%m-%d",
      rotate: 45,
    },
  };

  generateWeightChart({ dates, weights, dateAxisConfig });
  generateWeightDiffChart({ dates, weightDiffs, dateAxisConfig });
  generateWeightDiffSpeedChart({ dates, weightDiffSpeeds, dateAxisConfig });
}

function generateWeightChart({ dates, weights, dateAxisConfig }) {
  return c3.generate({
    bindto: ".weight-chart",
    size: {
      height: 960,
    },
    data: {
      x: "date",
      y: "weight",
      columns: [
        ["date", ...dates],
        ["weight", ...weights],
      ],
      types: {
        weight: "line",
      },
    },
    axis: {
      x: dateAxisConfig,
      y: {
        label: {
          text: "weight [kg]",
          position: "outer-middle",
        },
      },
    },
  });
}

function generateWeightDiffChart({ dates, weightDiffs, dateAxisConfig }) {
  return c3.generate({
    bindto: ".weight-diff-chart",
    size: {
      height: 250,
    },
    data: {
      x: "date",
      y: "weight_diff",
      columns: [
        ["date", ...dates],
        ["weight_diff", ...weightDiffs],
      ],
      types: {
        weight_diff: "line",
      },
    },
    axis: {
      x: dateAxisConfig,
      y: {
        label: {
          text: "weight diff [kg]",
          position: "outer-middle",
        },
      },
    },
  });
}

function generateWeightDiffSpeedChart({
  dates,
  weightDiffSpeeds,
  dateAxisConfig,
}) {
  return c3.generate({
    bindto: ".weight-diff-speed-chart",
    data: {
      x: "date",
      y: "weight_diff_speed",
      columns: [
        ["date", ...dates],
        ["weight_diff_speed", ...weightDiffSpeeds],
      ],
      types: {
        weight_diff_speed: "area-step",
      },
    },
    axis: {
      x: dateAxisConfig,
      y: {
        label: {
          text: "weight diff speed [kg/day]",
          position: "outer-middle",
        },
        tick: {
          format: (d) => round100(d),
        },
      },
    },
  });
}
