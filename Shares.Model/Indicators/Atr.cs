using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace Shares.Model.Indicators
{
    // Average True Range
    public class Atr
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, Parameters p, int startIndex, bool pad)
        {
            return Calculate(days, p.NSmoothingPeriods, startIndex, pad);
        }

        /// <summary>
        /// Returns ATR array of length [days.Length - nSmoothingPeriods + 1]
        /// </summary>
        public static IEnumerable<Point<decimal>> Calculate(ShareDay[] days, int nSmoothingPeriods, int startIndex, bool pad)
        {
            if (startIndex < 0 || startIndex + nSmoothingPeriods > days.Length)
                yield break;

            var trueRanges = TrueRange.Calculate(days, startIndex).ToList();

            var averageTrueRange = trueRanges.Take(nSmoothingPeriods).Average(t => t.Value);

            for (int i = pad ? 0 : nSmoothingPeriods - 1; i < nSmoothingPeriods; i++) 
                yield return Point.With(days[i].Date, averageTrueRange);

            foreach (var trueRange in trueRanges.Skip(nSmoothingPeriods))
            {
                averageTrueRange = (averageTrueRange * (nSmoothingPeriods - 1) + trueRange.Value) / nSmoothingPeriods;
                yield return Point.With(trueRange.DateTime, averageTrueRange);
            }
        }

        public class Parameters
        {
            public Parameters()
            {
                NSmoothingPeriods = 14;
            }

            [Description("The number of periods to include in the rolling average.")]
            [DisplayName("n smoothing periods")]
            public int NSmoothingPeriods { get; set; }
        }
    }
}
