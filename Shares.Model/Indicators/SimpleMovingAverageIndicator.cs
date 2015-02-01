using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shares.Model.Indicators
{
    public class SimpleMovingAverageIndicator
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, SimpleMovingAverageIndicatorParameters p)
        {
            return Calculate(days, d => d.Date, d => d.Close, p);
        }

        public IEnumerable<Point<decimal>> Calculate<T>(T[] days, Func<T, DateTime> date, Func<T, decimal> value, SimpleMovingAverageIndicatorParameters p)
        {
            if (p.Periods > days.Length)
                yield break;

            var total = days.Select(value).Take(p.Periods).Sum();
            yield return Point.With(date(days[p.Periods - 1]), total / p.Periods);

            for (int i = p.Periods; i < days.Length; i++)
            {
                total -= value(days[i - p.Periods]);
                total += value(days[i]);
                yield return Point.With(date(days[i]), total / p.Periods);
            }
        }
    }
}
