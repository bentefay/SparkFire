using System.ComponentModel;

namespace Shares.Model.Indicators
{
    public class SimpleMovingAverageIndicatorParameters
    {
        public SimpleMovingAverageIndicatorParameters()
        {
            Periods = 10;
        }

        [Description("The number of periods to include in the moving average.")]
        [DisplayName("Periods")]
        public int Periods { get; set; }
    }
}