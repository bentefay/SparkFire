using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace Shares.Model.Indicators
{
    public class TradingBand
    {
        public IEnumerable<Point> Calculate(ShareDay[] days, Parameters p)
        {
            return Calculate(days, p.Periods, p.PlusMinusPercentage);
        }

        /// <summary>
        /// Returns trading band array of length [days.Length - periods + 1]
        /// </summary>
        public static IEnumerable<Point> Calculate(ShareDay[] days, int periods, decimal plusMinusPercentage)
        {
            var sma = Sma.Calculate(days, periods);
            var tradingBand = sma.Select(p => new Point
            {
                DateTime = p.DateTime,
                Indicator = p.Value,
                Upper = (p.Value*(100 + plusMinusPercentage))/100,
                Lower = (p.Value*(100 - plusMinusPercentage))/100
            });
            return tradingBand;
        }

        public class Point
        {
            public DateTime DateTime { get; set; }
            public decimal Upper { get; set; }
            public decimal Indicator { get; set; }
            public decimal Lower { get; set; }
        }

        public class Parameters
        {
            public Parameters()
            {
                Periods = 15;
                PlusMinusPercentage = 8;
            }

            [Description("The number of periods to use for calculating the moving average.")]
            [DisplayName("Periods")]
            public int Periods { get; set; }


            [Description("The percentage offsetting the upper and lower bands from the indicator line.")]
            [DisplayName("Plus Minus Percentage")]
            public decimal PlusMinusPercentage { get; set; }
        }
    }
}