using System.Collections.Generic;
using System.ComponentModel;

namespace Shares.Model.Indicators
{
    public class TradingBand
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, Parameters p)
        {
            return Calculate(days, p.Periods);
        }

        /// <summary>
        /// Returns trading band array of length [days.Length - periods + 1]
        /// </summary>
        public static IEnumerable<Point<decimal>> Calculate(ShareDay[] days, int periods)
        {
            var sma = Sma.Calculate(days, periods);
            return sma;
        }

        public class Parameters
        {
            public Parameters()
            {
                Periods = 15;
            }

            [Description("The number of periods to use for calculating the moving average.")]
            [DisplayName("Periods")]
            public int Periods { get; set; }
        }
    }
}