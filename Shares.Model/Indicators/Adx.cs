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
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, Parameters p)
        {
            return Calculate(days, p.Periods);
        }

        public static IEnumerable<Point<decimal>> Calculate(ShareDay[] days, int shortPeriods)
        {
            throw new Exception();
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
}
