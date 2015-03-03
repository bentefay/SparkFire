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
        /// <summary>
        /// The ADX (Average Directional Index) is a combination of two other indicators developed by Wilder:
        /// - the positive directional indicator (+DI) 
        /// - and the negative directional indicator (-DI).
        ///  
        /// The ADX combines them and smooths the result with an exponential moving average.
        /// 
        /// First, calculate directional movement values (+DM and −DM):
        /// 
        /// UpMove = today's high − yesterday's high
        /// DownMove = yesterday's low − today's low
        /// if UpMove > DownMove and UpMove > 0, then +DM = UpMove, else +DM = 0
        /// if DownMove > UpMove and DownMove > 0, then −DM = DownMove, else −DM = 0
        /// 
        /// Using a fixed number of periods (Wilder used 14 days originally) for the ATR and EMA:
        /// 
        /// +DI = 100 times exponential moving average of (+DM) divided by average true range
        /// −DI = 100 times exponential moving average of (−DM) divided by average true range
        /// ADX = 100 times the exponential moving average of the absolute value of (+DI − −DI) divided by (+DI + −DI)
        /// 
        /// </summary>
        public IEnumerable<Point> Calculate(ShareDay[] days, Parameters p)
        {
            return Calculate(days, p.Periods);
        }

        /// <summary>
        /// Returns directional movement array of length [days.Length - 1]
        /// </summary>
        public static IEnumerable<DirectionalMovementPoint> CalculateDirectionalMovement(ShareDay[] days)
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

        public static IEnumerable<Point> Calculate(ShareDay[] days, int periods)
        {
            // Plus/minus directional movements
            var dmPoints = CalculateDirectionalMovement(days).ToArray();
            
            // Emas of directional movement
            var positiveDmEma = Ema.Calculate(dmPoints, p => p.DateTime, p => p.PositiveDm, periods, simpleMultiplier: true).ToArray();
            var negativeDmEma = Ema.Calculate(dmPoints, p => p.DateTime, p => p.NegativeDm, periods, simpleMultiplier: true).ToArray();
            
            var atr = Atr.Calculate(days, periods, 0, pad: false, includeFirstTrueRange: false).ToArray();
            
            // Plus/minus directional indicator
            var positiveDi = positiveDmEma.ZipEnds(atr, (ema, a) => Model.Point.With(ema.DateTime, 100 * ema.Value / a.Value)).ToArray();
            var negativeDi = negativeDmEma.ZipEnds(atr, (ema, a) => Model.Point.With(ema.DateTime, 100 * ema.Value / a.Value)).ToArray();
            
            // Directional index
            var dx = positiveDi.Zip(negativeDi, (p, n) => Model.Point.With(p.DateTime, 
                100 * Math.Abs(p.Value - n.Value) / Math.Abs(p.Value + n.Value))).ToArray();
            
            // Average directional index
            var adx = Ema.Calculate(dx, p => p.DateTime, p => p.Value, periods, simpleMultiplier: true).ToArray();

            for (int i = 0, j = periods - 1; i < adx.Length; i++, j++)
            {
                yield return new Point
                {
                    DateTime = adx[i].DateTime, 
                    Adx = adx[i].Value, 
                    NegativeDi = negativeDi[j].Value, 
                    PositiveDi = positiveDi[j].Value
                };
            }
        }

        public class Parameters
        {
            public Parameters()
            {
                Periods = 14;
            }

            [Description("The number of periods to include in the moving averages.")]
            [DisplayName("Periods")]
            public int Periods { get; set; }
        }

        public class DirectionalMovementPoint
        {
            public DateTime DateTime { get; set; }
            public decimal PositiveDm { get; set; }
            public decimal NegativeDm { get; set; }

            public override string ToString()
            {
                return String.Format("({0}, +Dm: {1}, -Dm: {2})",
                    DateTime, PositiveDm, NegativeDm);
            }
        }
        
        public class Point
        {
            public DateTime DateTime { get; set; }
            public Decimal PositiveDi { get; set; }
            public Decimal NegativeDi { get; set; }
            public Decimal Adx { get; set; }

            public override string ToString()
            {
                return String.Format("({0}, +Di: {1}, -Di: {2}, {3})", 
                    DateTime, PositiveDi, NegativeDi, Adx);
            }
        }
    }
}
