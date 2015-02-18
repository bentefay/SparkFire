using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace Shares.Model.Indicators
{
    // Exponential Moving Average
    public class Ema
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, Parameters p)
        {
            return Calculate(days, d => d.Date, d => d.Close, p.Periods);
        }

        public static IEnumerable<Point<decimal>> Calculate(ShareDay[] days, int periods)
        {
            return Calculate(days, d => d.Date, d => d.Close, periods);
        }

        /// <summary>
        /// Returns exponential moving average array of length [days.Length - periods + 1]
        /// </summary>
        public static IEnumerable<Point<decimal>> Calculate<T>(T[] days, Func<T, DateTime> date, Func<T, decimal> value, int periods, bool pad = false, bool simpleMultiplier = false)
        {
            if (periods > days.Length)
                yield break;

            var average = days.Take(periods).Average(value);

            for (int i = pad ? 0 : periods - 1; i < periods; i++)
                yield return Point.With(date(days[i]), average);

            var multiplier = simpleMultiplier ? 1M / Math.Max(periods, 1) : 2 / (periods + 1M);
            var ema = average;

            for (int i = periods; i < days.Length; i++)
            {
                // Equivalent to: (value - ema * (periods - 1)) / periods (if not using standar multiplier)
                ema = (value(days[i]) - ema) * multiplier + ema;
                yield return Point.With(date(days[i]), ema);
            }
        }

        public class Parameters
        {
            public Parameters()
            {
                Periods = 5;
            }

            [Description("The number of periods to include in the moving average.")]
            [DisplayName("Periods")]
            public int Periods { get; set; }
        }
    }
}