using System;
using System.Collections;
using System.Diagnostics;
using System.IO;
using System.Linq;
using CsvHelper;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shares.Model.Indicators;

namespace Shares.Model.Test.Indicators
{
    [TestClass]
    public class MacdhTests
    {
        [TestMethod]
        public void MacdhTest()
        {
            using (var csvReader = new CsvReader(new StreamReader("Indicators/MacdhTests.csv")))
            {
                var expectedData = csvReader.GetRecords<MacdhDay>().ToList();

                var days = expectedData.Select(r => new ShareDay { Date = r.Date, Close = r.Price }).ToArray();
                var actual = new Macdh().Calculate(days, new Macdh.Parameters { LongEmaPeriods = 26, ShortEmaPeriods = 12, SignalEmaPeriods = 9 }).ToArray();

                var expected = expectedData.Where(r => r.Macdh.HasValue).Select(r => Point.With(r.Date, r.Macdh.Value)).ToArray();

                EnumerableAssert.AreEqual(expected, actual, new PointComparer(7));
            }
        }

        [TestMethod]
        public void MacdSignalLineTest()
        {
            using (var csvReader = new CsvReader(new StreamReader("Indicators/MacdhTests.csv")))
            {
                var expectedData = csvReader.GetRecords<MacdhDay>().ToList();

                var days = expectedData.Select(r => new ShareDay { Date = r.Date, Close = r.Price }).ToArray();
                var actual = new MacdSignalLine().Calculate(days, 
                    new MacdSignalLine.Parameters { LongEmaPeriods = 26, ShortEmaPeriods = 12, SignalEmaPeriods = 9 })
                    .Select(s => Point.With(s.DateTime, s.SignalLine))
                    .ToArray();

                var expected = expectedData.Where(r => r.Ema9.HasValue).Select(r => Point.With(r.Date, r.Ema9.Value)).ToArray();

                EnumerableAssert.AreEqual(expected, actual, new PointComparer(7));
            }
        }

        [TestMethod]
        public void MacdTest()
        {
            using (var csvReader = new CsvReader(new StreamReader("Indicators/MacdhTests.csv")))
            {
                var expectedData = csvReader.GetRecords<MacdhDay>().ToList();

                var days = expectedData.Select(r => new ShareDay { Date = r.Date, Close = r.Price }).ToArray();
                var actual = new Macd().Calculate(days,
                    new Macd.Parameters { LongEmaPeriods = 26, ShortEmaPeriods = 12 }).ToArray();

                var expected = expectedData.Where(r => r.Macd.HasValue).Select(r => Point.With(r.Date, r.Macd.Value)).ToArray();

                EnumerableAssert.AreEqual(expected, actual, new PointComparer(7));
            }
        }

        public class MacdhDay
        {
            public DateTime Date { get; set; }
            public decimal Price { get; set; }
            public decimal? Ema26 { get; set; }
            public decimal? Ema12 { get; set; }
            public decimal? Macd { get; set; }
            public decimal? Ema9 { get; set; }
            public decimal? Macdh { get; set; }
        }
    }
}