import "./style.css";
import "c3/c3.css";

import c3 from "c3";
import weightData from "./data/test-data.json";

const averageStepInput = document.querySelector(
  ".average-step-input"
) as HTMLInputElement;
const dateFromInput = document.querySelector(
  ".date-from-input"
) as HTMLInputElement;
const dateToInput = document.querySelector(
  ".date-to-input"
) as HTMLInputElement;
const refreshBtn = document.querySelector(".refresh-btn");

refreshBtn?.addEventListener("click", () => {
  const averageStep =
    (averageStepInput?.value && parseInt(averageStepInput.value, 10)) || 1;
  const dateFrom = dateFromInput?.value;
  const dateTo = dateToInput?.value;

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

type WeightEntry = {
  date: string;
  weight: string;
};

type WeightEntryEnhanced = WeightEntry & {
  timestamp: number;
};

type WeightData = {
  timeline: WeightEntry[];
};

type RefreshArgs = {
  weightData: WeightData;
  averageStep: number;
  dateFrom?: string;
  dateTo?: string;
};

function refresh({ weightData, averageStep, dateFrom, dateTo }: RefreshArgs) {
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

  const { dates, weights, weightDiffs, weightDiffSpeeds } =
    processWeightTimeline(averageTimeline);

  generateCharts({
    dates,
    weights,
    weightDiffs,
    weightDiffSpeeds,
  });
}

type AverageTimelineAcc = {
  newTimeline: WeightEntryEnhanced[];
  itemsForNextAverage: WeightEntryEnhanced[];
};

function createAverageTimeline(
  originTimeline: WeightEntryEnhanced[],
  averageStep: number
) {
  return originTimeline.reduce<AverageTimelineAcc>(
    (acc, item, index) => {
      const { newTimeline, itemsForNextAverage } = acc;

      const [firstItemOfAverage] = itemsForNextAverage;
      if (!firstItemOfAverage) {
        return { newTimeline, itemsForNextAverage: [item] };
      }

      const isLastItem = index === originTimeline.length - 1;

      const dateDaysDiff = dayDiff(
        firstItemOfAverage.timestamp,
        item.timestamp
      );

      if (dateDaysDiff < averageStep) {
        itemsForNextAverage.push(item);
        if (!isLastItem) {
          return { newTimeline, itemsForNextAverage };
        }
        newTimeline.push(createAverageWeightItem(itemsForNextAverage));
        return { newTimeline, itemsForNextAverage: [] };
      }

      newTimeline.push(createAverageWeightItem(itemsForNextAverage));
      if (isLastItem) {
        newTimeline.push(item);
      }

      return {
        newTimeline,
        itemsForNextAverage: [item],
      };
    },
    { newTimeline: [], itemsForNextAverage: [] } as AverageTimelineAcc
  ).newTimeline;
}

function createAverageWeightItem(items: WeightEntryEnhanced[]) {
  const sum = items.reduce((acc, item) => acc + parseFloat(item.weight), 0);
  const averageWeight = round100(sum / items.length);
  const lastItem = items[items.length - 1];
  return {
    date: lastItem.date,
    timestamp: lastItem.timestamp,
    weight: "" + averageWeight,
  };
}

function processWeightTimeline(timeline: WeightEntryEnhanced[]) {
  let dates: string[] = [];
  let weights: number[] = [];
  let weightDiffs: number[] = [];
  let weightDiffSpeeds: number[] = [];

  timeline.reduce<{ prevWeight?: number; prevTimestamp?: number }>(
    ({ prevWeight, prevTimestamp }, item) => {
      const { date: dateStr, timestamp } = item;
      dates.push(dateStr);

      const weight = parseFloat(item.weight);
      weights.push(weight);

      const weightDiff = prevWeight ? round100(weight - prevWeight) : 0;
      weightDiffs.push(weightDiff);

      const dateDaysDiff = prevTimestamp
        ? dayDiff(prevTimestamp, timestamp)
        : 0;
      const weightDiffSpeed = dateDaysDiff
        ? round100(weightDiff / dateDaysDiff)
        : 0;
      weightDiffSpeeds.push(weightDiffSpeed);

      return {
        prevWeight: weight,
        prevTimestamp: timestamp,
      };
    },
    {}
  );

  return {
    dates,
    weights,
    weightDiffs,
    weightDiffSpeeds,
  };
}

function round100(number: number) {
  return Math.round(number * 100) / 100;
}

function dayDiff(firstTime: number, secondTime: number) {
  return Math.round((secondTime - firstTime) / (1000 * 60 * 60 * 24));
}

type GenerateChartsArgs = {
  dates: string[];
  weights: number[];
  weightDiffs: number[];
  weightDiffSpeeds: number[];
};

function generateCharts({
  dates,
  weights,
  weightDiffs,
  weightDiffSpeeds,
}: GenerateChartsArgs) {
  const dateAxisConfig: c3.XAxisConfiguration = {
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

type GenerateWeightChartArgs = {
  dates: string[];
  weights: number[];
  dateAxisConfig: c3.XAxisConfiguration;
};

function generateWeightChart({
  dates,
  weights,
  dateAxisConfig,
}: GenerateWeightChartArgs) {
  return c3.generate({
    bindto: ".weight-chart",
    size: {
      height: 960,
    },
    data: {
      x: "date",
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

type GenerateWeightDiffChartArgs = {
  dates: string[];
  weightDiffs: number[];
  dateAxisConfig: c3.XAxisConfiguration;
};

function generateWeightDiffChart({
  dates,
  weightDiffs,
  dateAxisConfig,
}: GenerateWeightDiffChartArgs) {
  return c3.generate({
    bindto: ".weight-diff-chart",
    size: {
      height: 250,
    },
    data: {
      x: "date",
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

type GenerateWeightDiffSpeedChartArgs = {
  dates: string[];
  weightDiffSpeeds: number[];
  dateAxisConfig: c3.XAxisConfiguration;
};

function generateWeightDiffSpeedChart({
  dates,
  weightDiffSpeeds,
  dateAxisConfig,
}: GenerateWeightDiffSpeedChartArgs) {
  return c3.generate({
    bindto: ".weight-diff-speed-chart",
    data: {
      x: "date",
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
