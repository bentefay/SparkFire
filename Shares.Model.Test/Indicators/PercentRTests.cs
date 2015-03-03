using System;
using System.IO;
using System.Linq;
using CsvHelper;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shares.Model.Indicators;

namespace Shares.Model.Test.Indicators
{
    [TestClass]
    public class PercentRTests
    {
        [TestMethod]
        public void TestAdx()
        {
            using (var csvReader = new CsvReader(new StreamReader("Indicators/PercentRTests.csv")))
            {
                var expectedData = csvReader.GetRecords<PercentRDay>().ToList();

                var days = expectedData.Select(r => new ShareDay { Date = r.Date, High = r.High, Low = r.Low, Close = r.Close }).ToArray();
                var actual = new PercentR().Calculate(days, new PercentR.Parameters { Periods = 14 }).ToArray();

                var expected = expectedData.Where(r => r.PercentR14.HasValue)
                    .Select(r => Point.With(r.Date, r.PercentR14.Value)).ToArray();

                EnumerableAssert.AreEqual(expected, actual, new PointComparer(6), printAll: false);
            }
        }

        public class PercentRDay
        {
            public DateTime Date { get; set; }
            public decimal High { get; set; }
            public decimal Low { get; set; }
            public decimal Close { get; set; }
            public decimal? MinLow14 { get; set; }
            public decimal? MaxHigh14 { get; set; }
            public decimal? PercentR14 { get; set; }
        }
    }
}