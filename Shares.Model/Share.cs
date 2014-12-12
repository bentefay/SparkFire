using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;

namespace Shares.Model
{
    public enum ShareAggregateType
    {
        Day,
        Week,
        Month,
        Quarter,
        Year
    }

    public class Share
    {
        public byte[] HeaderBytes { get; set; }
        public Byte[] Preamble { get; set; }
        public string MarketCode { get; set; }
        public string InstrumentCode { get; set; }
        public string CompanyName { get; set; }
        public Int32 Unknown1 { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public UInt32 RowCount { get; set; }
        public int Info1 { get; set; }
        public float StrikePrice { get; set; }
        public Byte[] InfoRemaining { get; set; }
        public string Details { get; set; }
        public ShareDay[] Days { get; set; }

        public Share ShallowClone()
        {
            return (Share)MemberwiseClone();
        }

        public Share DeepClone()
        {
            var share = ShallowClone();
            share.Days = Days.Select(d => d.DeepClone()).ToArray();
            return share;
        }

        public void Aggregate(ShareAggregateType aggregateType, int aggregateSize, bool isRelative, DateTime today)
        {
            if (aggregateSize <= 1 && aggregateType == ShareAggregateType.Day)
                return;

            if (Days.Length <= 1)
                return;

            var getGroupKey = GetDayShareGroupKeyFunction(aggregateType, aggregateSize, isRelative, today);

            var aggregatedDays = new List<ShareDay>();

            foreach (var grouping in GroupOrderedBy(Days, getGroupKey, (a, b) => a == b).Select(g => g.ToList()))
            {
                var first = grouping.First();

                foreach (var day in grouping.Skip(1))
                {
                    first.High = Math.Max(first.High, day.High);
                    first.Low = Math.Min(first.Low, day.Low);
                    first.Volume += day.Volume;
                }

                // Open and OpenInt already set.
                first.Close = grouping[grouping.Count - 1].Close;

                aggregatedDays.Add(first);
            }

            Days = aggregatedDays.ToArray();
        }

        private const double DaysInAWeek = 7.0;
        private const double DaysInAMonth = 30.4375;
        private const double DaysInAQuarter = 3 * 30.4375;
        private const double DaysInAYear = 365.25;

        private static Func<ShareDay, int> GetDayShareGroupKeyFunction(ShareAggregateType aggregateType, int aggregateSize, bool relative, DateTime today)
        {
            var function = GetDateGroupKeyFunction(aggregateType, aggregateSize, relative, today);
            return d => function(d.Date);
        }

        private static Func<DateTime, int> GetDateGroupKeyFunction(ShareAggregateType aggregateType, int aggregateSize, bool isRelative, DateTime today)
        {
            switch(aggregateType)
            {
                case ShareAggregateType.Day:
                    return d1 => ((int)(d1 - today).TotalDays) / aggregateSize;
                case ShareAggregateType.Week:
                    if (isRelative) return d1 => (int)((GetDaysFromZero(today) - GetDaysFromZero(d1)) / (DaysInAWeek * aggregateSize));
                    return d1 => (int)(GetDaysFromZero(d1) - d1.DayOfWeek);
                case ShareAggregateType.Month:
                    if (isRelative) return d1 => (int)((GetDaysFromZero(today) - GetDaysFromZero(d1)) / (DaysInAMonth * aggregateSize));
                    return d1 => GetDaysFromZero(new DateTime(d1.Year, d1.Month, 1));
                case ShareAggregateType.Quarter:
                    if (isRelative) return d1 => (int)((GetDaysFromZero(today) - GetDaysFromZero(d1)) / (DaysInAQuarter * aggregateSize));
                    return d1 => GetDaysFromZero(new DateTime(d1.Year, ((d1.Month - 1) / 3) * 3 + 1, 1));
                case ShareAggregateType.Year:
                    if (isRelative) return d1 => (int)((GetDaysFromZero(today) - GetDaysFromZero(d1)) / (DaysInAYear * aggregateSize));
                    return d1 => GetDaysFromZero(new DateTime(d1.Year, 1, 1));
                default:
                    throw new InvalidOperationException("Unknown enum value.");
            }
        }

        private static int GetDaysFromZero(DateTime dateTime)
        {
            return (int)(dateTime.Ticks/(24*60*60*10000000L));
        }

        public static IEnumerable<IEnumerable<T>> GroupOrderedBy<T, TKey>(IEnumerable<T> c, Func<T, TKey> getKey, Func<TKey, TKey, bool> isEqual)
        {                     
            var group = new List<T>();
            var first = true;
            var firstInGroupKey = default(TKey);
            
            foreach (var item in c)
            {
                if (first)
                {
                    first = false;
                    firstInGroupKey = getKey(item);
                    group.Add(item);
                } 
                else if (isEqual(firstInGroupKey, getKey(item)))
                {
                    group.Add(item);
                }
                else
                {
                    yield return group;
                    group = new List<T>();
                    firstInGroupKey = getKey(item);
                    group.Add(item);
                }
            }

            if (first)
                yield break;

            yield return group;
        }
    }
}