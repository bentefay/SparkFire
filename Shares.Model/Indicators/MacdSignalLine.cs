using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace Shares.Model.Indicators
{
    // Moving Average Convergence/Divergence Signal Line
    public class MacdSignalLine
    {
        public IEnumerable<Point> Calculate(ShareDay[] days, Parameters p)
        {
            return Calculate(days, p.SignalEmaPeriods, p.ShortEmaPeriods, p.LongEmaPeriods);
        }
        
        public static IEnumerable<Point> Calculate(ShareDay[] days, int signalPeriods, int shortPeriods, int longPeriods)
        {
            var macd = Macd.Calculate(days, shortPeriods, longPeriods).ToArray();
            var signalLine = Calculate(macd, signalPeriods).ToArray();
            return macd.ZipEnds(signalLine, (m, s) => new Point { DateTime = m.DateTime, Macd = m.Value, SignalLine = s.Value });
        }

        public static IEnumerable<Point<decimal>> Calculate(Point<decimal>[] macd, int signalPeriods)
        {
            return Ema.Calculate(macd, r => r.DateTime, r => r.Value, signalPeriods);
        }

        public class Point
        {
            public DateTime DateTime { get; set; }
            public decimal Macd { get; set; }
            public decimal SignalLine { get; set; }
        }

        public class Parameters : Macd.Parameters
        {
            public Parameters()
            {
                SignalEmaPeriods = 9;
            }

            [Description("The number of periods to use for the MACD EMA (signal line).")]
            [DisplayName("Long Periods")]
            public int SignalEmaPeriods { get; set; }
        }
    }
}