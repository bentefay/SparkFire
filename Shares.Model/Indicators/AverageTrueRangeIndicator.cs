using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

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

    public class AverageTrueRangeIndicator
    {
        public IEnumerable<Point<float>> Calculate(ShareDay[] days, int startIndex, AverageTrueRangeIndicatorParameters p)
        {
            if (startIndex + p.NSmoothingPeriods > days.Length)
                yield break;

            var trueRanges = GetTrueRanges(days, startIndex).ToList();

            var averageTrueRange = trueRanges.Take(p.NSmoothingPeriods).Average(t => t.Value);

            yield return Point.With(days[p.NSmoothingPeriods - 1].Date, averageTrueRange);

            foreach (var trueRange in trueRanges.Skip(p.NSmoothingPeriods))
            {
                averageTrueRange = averageTrueRange * (p.NSmoothingPeriods - 1) + trueRange.Value;
                yield return Point.With(trueRange.DateTime, averageTrueRange);
            }
        }

        public IEnumerable<Point<float>> GetTrueRanges(ShareDay[] days, int startIndex)
        {
            if (startIndex >= days.Length)
                yield break;

            yield return Point.With(days[startIndex].Date, days[startIndex].High - days[startIndex].Low);

            var previous = days[startIndex];

            for (int i = startIndex + 1; i < days.Length; i++)
            {
                var current = days[i];

                var trueRange = new[]
                {
                    current.High - current.Low, 
                    Math.Abs(current.High - previous.Close), 
                    Math.Abs(current.Low - previous.Close)
                }.Max();

                yield return Point.With(current.Date, trueRange);

                previous = current;
            }
        }
    }
}
