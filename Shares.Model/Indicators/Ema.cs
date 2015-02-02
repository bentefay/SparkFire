using System;
using System.Collections.Generic;
using System.Linq;

namespace Shares.Model.Indicators
{
    // Exponential Moving Average
    public class Ema
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, EmaParameters p)
        {
            return Calculate(days, d => d.Date, d => d.Close, p.Periods);
        }

        public static IEnumerable<Point<decimal>> Calculate(ShareDay[] days, int periods)
        {
            return Calculate(days, d => d.Date, d => d.Close, periods);
        }

        public static IEnumerable<Point<decimal>> Calculate<T>(T[] days, Func<T, DateTime> date, Func<T, decimal> value, int periods)
        {
            if (periods > days.Length)
                yield break;

            var sma = days.Select(value).Take(periods).Sum() / periods;
            yield return Point.With(date(days[periods - 1]), sma);

            var multiplier = 2 / (periods + 1M);
            var ema = sma;

            for (int i = periods; i < days.Length; i++)
            {
                ema = (value(days[i]) - ema) * multiplier + ema;
                yield return Point.With(date(days[i]), ema);
            }
        }
    }
}