using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using MoreLinq;

namespace Shares.Model.Indicators
{
    // Williams Percentage R
    public class PercentR
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, Parameters p)
        {
            return Calculate(days, p.Periods);
        }

        /// <summary>
        /// Returns %R array of length [days.Length - nSmoothingPeriods + 1]
        /// </summary>
        public static IEnumerable<Point<decimal>> Calculate(ShareDay[] days, int periods)
        {
            return days
                .FullWindow(periods)
                .Select(w =>
                {
                    var min = w.Min(d => d.Low);
                    var max = w.Max(d => d.High);
                    var last = w.Last();
                    return Point.With(last.Date, (max - last.Close) / (max - min) * -100);
                });
        }

        public class Parameters
        {
            public Parameters()
            {
                Periods = 14;
            }

            [Description("The number of periods to use for calculating the lowest low and highest high.")]
            [DisplayName("Periods")]
            public int Periods { get; set; }
        }
    }
}