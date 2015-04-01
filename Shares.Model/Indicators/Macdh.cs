using System.Collections.Generic;
using System.Linq;

namespace Shares.Model.Indicators
{
    // Moving Average Convergence/Divergence Histogram
    public class Macdh
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, Parameters p)
        {
            return Calculate(days, p.SignalEmaPeriods, p.ShortEmaPeriods, p.LongEmaPeriods);
        }

        public static IEnumerable<Point<decimal>> Calculate(ShareDay[] days, int signalPeriods, int shortPeriods, int longPeriods)
        {
            var macd = Macd.Calculate(days, shortPeriods, longPeriods).ToArray();
            var signalLine = MacdSignalLine.Calculate(macd, signalPeriods).ToArray();
            return macd.ZipEnds(signalLine, (m, s) => Point.With(m.DateTime, m.Value - s.Value));
        }

        public class Parameters : MacdSignalLine.Parameters
        {
        }
    }
}