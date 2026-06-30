import { SimpleLinearRegression } from "ml-regression";
import MLR from "ml-regression-multivariate-linear";


export const trainModel = (data) => {
  const X = data.map(d => [
    d.prev1,
    d.prev2,
    d.prev3,
    d.isWeekend,
    d.sin,
    d.cos,
    d.trend
  ]);

  const y = data.map(d => [d.demand]);

  return new MLR(X, y);
};

export const forecastNextDays = (model, lastData, daysToPredict) => {
  const predictions = [];

  let prev1 = lastData.demand;
  let prev2 = lastData.prev1;
  let prev3 = lastData.prev2;

  let currentDate = new Date(lastData.date); // ✅ FIXED

  for (let i = 0; i < daysToPredict; i++) {
    currentDate.setDate(currentDate.getDate() + 1);

    const dayOfWeek = currentDate.getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6) ? 1 : 0;

    const t = lastData.trend + i + 1;

    const sin = Math.sin((2 * Math.PI * t) / 7);
    const cos = Math.cos((2 * Math.PI * t) / 7);

    const predicted = Math.round(
      model.predict([
        prev1,
        prev2,
        prev3,
        isWeekend,
        sin,
        cos,
        t
      ])[0]
    );

    predictions.push({
      date: currentDate.toISOString().split("T")[0],
      demand: predicted
    });

    // ✅ reduced drift
    prev3 = prev2;
    prev2 = prev1;
    prev1 = 0.8 * predicted + 0.2 * prev1;
  }

  return predictions;
};