using System.ComponentModel;

namespace Shares.Model.Indicators
{
    public class EmaParameters
    {
        public EmaParameters()
        {
            Periods = 5;
        }

        [Description("The number of periods to include in the moving average.")]
        [DisplayName("Periods")]
        public int Periods { get; set; }
    }
}