using Shares.Model.Indicators;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MoreLinq;

namespace Shares.Model.Experiments
{
    public class Experiment1
    {
        public IEnumerable<Trade> RunExperiment(Share daily, DateTime now)
        {
            var weekly = daily.DeepClone();
            weekly.Aggregate(ShareAggregateType.Week, aggregateSize: 1, isRelative: true, today: now);

            var weeklyAdx = Adx.Calculate(weekly.Days).ToArray();
            var weeklyMacdh = Macdh.Calculate(weekly.Days).ToArray();
            var indexOffset = weeklyMacdh.Length - weeklyAdx.Length;
            var dailyMacdh = Macdh.Calculate(daily.Days).ToArray();

            foreach (var crossover in FindCrossOvers<Adx.Point, decimal>(weeklyAdx, p => p.PositiveDi, p => p.NegativeDi, 3).Where(crossover => crossover.Value > 0))
            {
                var macdhT0 = weeklyMacdh[indexOffset + crossover.Index - 1].Value;
                var macdhT1 = weeklyMacdh[indexOffset + crossover.Index].Value;

                if (macdhT1 > macdhT0)
                {
                    yield break;
                }
            }

        }

        public IEnumerable<IndexedValue<int>> FindCrossOvers<T, TValue>(IEnumerable<T> periods, Func<T, decimal> getValue1, Func<T, decimal> getValue2, int lookahead)
        {
            int i = 0;
            foreach (var value in periods.Pairwise((lastPeriod, thisPeriod) => new { lastPeriod, thisPeriod }))
            {
                i++;
                var lastPeriod = value.lastPeriod;
                var thisPeriod = value.thisPeriod;

                var v1T1 = getValue1(thisPeriod);
                var v2T1 = getValue2(thisPeriod);

                var gradient1 = v1T1 - getValue1(lastPeriod);
                var gradient2 = v2T1 - getValue2(lastPeriod);

                var projectedValue1 = v1T1 + gradient1 * lookahead;
                var projectedValue2 = v2T1 + gradient2 * lookahead;

                var projectedChange = Math.Sign(projectedValue1 - projectedValue2);

                if (Math.Sign(v1T1 - v2T1) != projectedChange)
                    yield return IndexedValue.New(i, projectedChange);
            };
        }
    }

    public class Trade
    {
        public DateTime BuyDateTime { get; set; }
        public DateTime SellDateTIme { get; set; }
    }

    public static class IndexedValue
    {
        public static IndexedValue<T> New<T>(int index, T value)
        {
            return new IndexedValue<T>(index, value);
        }
    }

    public struct IndexedValue<T>
    {
        public IndexedValue(int index, T value)
        {
            Index = index;
            Value = value;
        }

        public int Index { get; private set; }
        public T Value { get; private set; }
    }
}
