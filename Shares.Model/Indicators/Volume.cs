using System.Collections.Generic;
using System.Linq;

namespace Shares.Model.Indicators
{
    public class Volume
    {
        public static IEnumerable<Point<uint>> Calculate(ShareDay[] days)
        {
            return days.Select(d => Point.With<uint>(d.Date, d.Volume));
        }
    }
}