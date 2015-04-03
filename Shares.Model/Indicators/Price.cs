using System;
using System.Collections.Generic;
using System.Linq;

namespace Shares.Model.Indicators
{
    public class Price
    {
        public static IEnumerable<Point> Calculate(ShareDay[] days)
        {
            return days.Select(d => new Point { DateTime = d.Date, Open = d.Open, High = d.High, Low = d.Low, Close = d.Close });
        }

        public class Point
        {
            public DateTime DateTime { get; set; }
            public Decimal Open { get; set; }
            public Decimal High { get; set; }
            public Decimal Low { get; set; }
            public Decimal Close { get; set; }
        }
    }
}