export const createFeatures = (data) => {
  const result = [];

  for (let i = 3; i < data.length; i++) {
    const current = data[i];
    const dateObj = new Date(current.date);

    const dayOfWeek = dateObj.getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6) ? 1 : 0;

    // weekly cycle (VERY IMPORTANT)
    const sin = Math.sin((2 * Math.PI * i) / 7);
    const cos = Math.cos((2 * Math.PI * i) / 7);

    result.push({
      date: current.date,

      prev1: data[i - 1].demand,
      prev2: data[i - 2].demand,
      prev3: data[i - 3].demand,

      isWeekend,
      sin,
      cos,
      trend: i,

      demand: current.demand
    });
  }

  return result;
};