using System;
using System.Collections.Generic;
using System.Linq;

namespace Shares.Model.Indicators
{
    public class TrueRange
    {
        public IEnumerable<Point<decimal>> Calculate(ShareDay[] days, int startIndex)
        {
            if (startIndex >= days.Length)
                yield break;

            var previous = days[startIndex];

            yield return Point.With(previous.Date, previous.High - previous.Low);

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