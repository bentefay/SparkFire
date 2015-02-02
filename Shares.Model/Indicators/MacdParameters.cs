using System.ComponentModel;

namespace Shares.Model.Indicators
{
    public class MacdParameters
    {
        public MacdParameters()
        {
            ShortEmaPeriods = 12;
            LongEmaPeriods = 26;
        }

        [Description("The shorter number of periods to use for the EMA.")]
        [DisplayName("Short Periods")]
        public int ShortEmaPeriods { get; set; }

        [Description("The larger number of periods to use for the EMA.")]
        [DisplayName("Long Periods")]
        public int LongEmaPeriods { get; set; }
    }
}