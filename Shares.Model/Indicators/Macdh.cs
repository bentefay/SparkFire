using System.Collections.Generic;
using System.Linq;

namespace Shares.Model.Indicators
{
    // Moving Average Convergence/Divergence Histogram
    public class Macdh
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, MacdhParameters p)
        {
            return Calculate(days, p.SignalEmaPeriods, p.ShortEmaPeriods, p.LongEmaPeriods);
        }

        public static IEnumerable<Point<decimal>> Calculate(ShareDay[] days, int signalPeriods, int shortPeriods, int longPeriods)
        {
            var macd = Macd.Calculate(days, shortPeriods, longPeriods).ToArray();
            var signalLine = MacdSignalLine.Calculate(macd, signalPeriods).ToArray();
            var macdNormalised = macd.Skip(signalPeriods - 1);
            return macdNormalised.Select((r, i) => Point.With(r.DateTime, r.Value - signalLine[i].Value));
        }
    }
}