using System;
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
            return Calculate(days, p.NSmoothingPeriods, startIndex, pad, includeFirstTrueRange: true);
        }

        /// <summary>
        /// Returns ATR array of length [days.Length - nSmoothingPeriods + 1]
        /// </summary>
        public static IEnumerable<Point<decimal>> Calculate(ShareDay[] days, int nSmoothingPeriods, int startIndex, bool pad, bool includeFirstTrueRange = true)
        {
            if (startIndex < 0 || startIndex + nSmoothingPeriods > days.Length)
                return Enumerable.Empty<Point<Decimal>>();

            var trueRanges = TrueRange.Calculate(days, startIndex, includeFirstTrueRange).ToArray();

            return Ema.Calculate(trueRanges, tr => tr.DateTime, tr => tr.Value, nSmoothingPeriods, pad: pad,
                simpleMultiplier: true);
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
