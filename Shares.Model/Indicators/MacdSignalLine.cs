using System.Collections.Generic;
using System.Linq;

namespace Shares.Model.Indicators
{
    // Moving Average Convergence/Divergence Signal Line
    public class MacdSignalLine
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days,
            MacdSignalLineParameters p)
        {
            return Calculate(days, p.SignalEmaPeriods, p.ShortEmaPeriods, p.LongEmaPeriods);
        }
        
        public static IEnumerable<Point<decimal>> Calculate(ShareDay[] days, int signalPeriods, int shortPeriods, int longPeriods)
        {
            return Calculate(
                Macd.Calculate(days, shortPeriods, longPeriods).ToArray(),
                signalPeriods);
        }

        public static IEnumerable<Point<decimal>> Calculate(Point<decimal>[] macd, int signalPeriods)
        {
            return Ema.Calculate(
                macd,
                r => r.DateTime,
                r => r.Value,
                signalPeriods);
        }
    }
}