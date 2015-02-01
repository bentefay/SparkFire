using System;
using System.Collections.Generic;
using System.Linq;

namespace Shares.Model.Indicators
{
    public class ExponentialMovingAverageIndicator
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, ExponentialMovingAverageIndicatorParameters p)
        {
            return Calculate(days, d => d.Date, d => d.Close, p);
        }

        public IEnumerable<Point<decimal>> Calculate<T>(T[] days, Func<T, DateTime> date, Func<T, decimal> value, ExponentialMovingAverageIndicatorParameters p)
        {
            if (p.Periods > days.Length)
                yield break;

            var sma = days.Select(value).Take(p.Periods).Sum() / p.Periods;
            yield return Point.With(date(days[p.Periods - 1]), sma);

            var multiplier = 2 / (p.Periods + 1M);
            var ema = sma;

            for (int i = p.Periods; i < days.Length; i++)
            {
                ema = (value(days[i]) - ema) * multiplier + ema;
                yield return Point.With(date(days[i]), ema);
            }
        }
    }
}