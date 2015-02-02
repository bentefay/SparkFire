using System.Collections.Generic;
using System.Linq;

namespace Shares.Model.Indicators
{
    // Average True Range
    public class Atr
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, AtrParameters p, int startIndex, bool pad)
        {
            if (startIndex < 0 || startIndex + p.NSmoothingPeriods > days.Length)
                yield break;

            var trueRanges = new TrueRange().Calculate(days, startIndex).ToList();

            var averageTrueRange = trueRanges.Take(p.NSmoothingPeriods).Average(t => t.Value);

            for (int i = pad ? 0 : p.NSmoothingPeriods - 1; i < p.NSmoothingPeriods; i++) 
                yield return Point.With(days[i].Date, averageTrueRange);

            foreach (var trueRange in trueRanges.Skip(p.NSmoothingPeriods))
            {
                averageTrueRange = (averageTrueRange * (p.NSmoothingPeriods - 1) + trueRange.Value) / p.NSmoothingPeriods;
                yield return Point.With(trueRange.DateTime, averageTrueRange);
            }
        }
    }
}
