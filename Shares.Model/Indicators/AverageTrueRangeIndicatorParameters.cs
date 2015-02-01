using System.ComponentModel;

namespace Shares.Model.Indicators
{
    public class AverageTrueRangeIndicatorParameters
    {
        public AverageTrueRangeIndicatorParameters()
        {
            NSmoothingPeriods = 14;
        }

        [Description("The number of periods to include in the rolling average.")]
        [DisplayName("n smoothing periods")]
        public int NSmoothingPeriods { get; set; }
    }
}