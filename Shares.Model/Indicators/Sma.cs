using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shares.Model.Indicators
{
    // Simple Moving Average
    public class Sma
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, SmaParameters p)
        {
            return Calculate(days, d => d.Date, d => d.Close, p.Periods);
        }

        public static IEnumerable<Point<decimal>> Calculate(ShareDay[] days, int periods)
        {
            return Calculate(days, d => d.Date, d => d.Close, periods);
        }

        public static IEnumerable<Point<decimal>> Calculate<T>(T[] days, Func<T, DateTime> date, Func<T, decimal> value, int periods)
        {
            if (periods > days.Length)
                yield break;

            var total = days.Select(value).Take(periods).Sum();
            yield return Point.With(date(days[periods - 1]), total / periods);

            for (int i = periods; i < days.Length; i++)
            {
                total -= value(days[i - periods]);
                total += value(days[i]);
                yield return Point.With(date(days[i]), total / periods);
            }
        }
    }
}
