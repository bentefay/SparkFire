using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shares.Model.Indicators
{
    public class Adx
    {
        /* 
        The ADX is a combination of two other indicators developed by Wilder, the positive directional indicator (abbreviated +DI) and negative directional indicator (-DI).
        The ADX combines them and smooths the result with an exponential moving average.

        To calculate +DI and −DI, one needs price data consisting of high, low, and closing prices each period (typically each day). 
        One first calculates the directional movement (+DM and −DM):

        UpMove = today's high − yesterday's high
        DownMove = yesterday's low − today's low
        if UpMove > DownMove and UpMove > 0, then +DM = UpMove, else +DM = 0
        if DownMove > UpMove and DownMove > 0, then −DM = DownMove, else −DM = 0
        After selecting the number of periods (Wilder used 14 days originally), +DI and −DI are:

        +DI = 100 times exponential moving average of (+DM) divided by average true range
        −DI = 100 times exponential moving average of (−DM) divided by average true range
        The exponential moving average is calculated over the number of periods selected, and the average true range is an exponential average of the true ranges. Then:

        ADX = 100 times the exponential moving average of the absolute value of (+DI − −DI) divided by (+DI + −DI)
        */

        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, Parameters p)
        {
            return Calculate(days, p.Periods);
        }

        public static IEnumerable<Point<decimal>> Calculate(ShareDay[] days, int shortPeriods)
        {
            throw new Exception();
        }

        /// <summary>
        /// Returns directional movement array of length [days.Length - 1]
        /// </summary>
        public static IEnumerable<DirectionalMovementPoint> DirectionalMovement(ShareDay[] days)
        {
            for (int i = 1; i < days.Length; i++)
            {
                var upMove = days[i].High - days[i - 1].High;
                var downMove = days[i - 1].Low - days[i].Low;
                var positiveDm = upMove > downMove && upMove > 0 ? upMove : 0;
                var negativeDm = downMove > upMove && downMove > 0 ? downMove : 0;
                yield return new DirectionalMovementPoint { DateTime = days[i].Date, PositiveDm = positiveDm, NegativeDm = negativeDm };
            }
        }

        public static IEnumerable<Point<Decimal>> DirectionalIndicator(ShareDay[] days, int periods)
        {
            var dmPoints = DirectionalMovement(days).ToArray();
            var positiveDmEma = Ema.Calculate(dmPoints, p => p.DateTime, p => p.PositiveDm, periods).ToArray();
            var negativeDmEma = Ema.Calculate(dmPoints, p => p.DateTime, p => p.NegativeDm, periods).ToArray();
            var atr = Atr.Calculate(days, periods, 0, false).ToArray();
            var positiveDi = positiveDmEma.ZipEnds(atr, (ema, a) => Point.With(ema.DateTime, 100 * ema.Value / a.Value));
            var negativeDi = negativeDmEma.ZipEnds(atr, (ema, a) => Point.With(ema.DateTime, 100 * ema.Value / a.Value));
            var preAdx = positiveDi.Zip(negativeDi, (p, n) => Point.With(p.DateTime, 100 * Math.Abs(p.Value - n.Value) / Math.Abs(p.Value + n.Value))).ToArray();
            var adx = Ema.Calculate(preAdx, p => p.DateTime, p => p.Value, periods);
            return adx;
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

    public class DirectionalMovementPoint
    {
        public DateTime DateTime { get; set; }
        public decimal PositiveDm { get; set; }
        public decimal NegativeDm { get; set; }
    }
}
