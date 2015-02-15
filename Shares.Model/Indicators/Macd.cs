using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace Shares.Model.Indicators
{
    // Moving Average Divergence/Convergence
    public class Macd
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, MacdParameters p)
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
    }
}