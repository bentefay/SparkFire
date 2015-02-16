using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;

namespace Shares.Model.Indicators
{
    // Moving Average Divergence/Convergence
    public class Macd
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, Parameters p)
        {
            return Calculate(days, p.ShortEmaPeriods, p.LongEmaPeriods);
        }

        public static IEnumerable<Point<decimal>> Calculate(ShareDay[] days, int shortPeriods, int longPeriods)
        {
            var longEma = Ema.Calculate(days, longPeriods).ToList();
            var shortEma = Ema.Calculate(days, shortPeriods).Skip(longPeriods - shortPeriods).ToList();

            Debug.Assert(longEma.Count == shortEma.Count);

            return shortEma.Select((t, i) => Point.With(t.DateTime, t.Value - longEma[i].Value));
        }

        public class Parameters
        {
            public Parameters()
            {
                ShortEmaPeriods = 12;
                LongEmaPeriods = 26;
            }

            [Description("The shorter number of periods to use for the EMA.")]
            [DisplayName("Short Periods")]
            public int ShortEmaPeriods { get; set; }

            [Description("The larger number of periods to use for the EMA.")]
            [DisplayName("Long Periods")]
            public int LongEmaPeriods { get; set; }
        }
    }
}