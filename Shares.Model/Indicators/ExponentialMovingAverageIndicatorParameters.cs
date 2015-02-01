using System.ComponentModel;

namespace Shares.Model.Indicators
{
    public class ExponentialMovingAverageIndicatorParameters
    {
        public ExponentialMovingAverageIndicatorParameters()
        {
            Periods = 5;
        }

        [Description("The number of periods to include in the moving average.")]
        [DisplayName("Periods")]
        public int Periods { get; set; }
    }
}