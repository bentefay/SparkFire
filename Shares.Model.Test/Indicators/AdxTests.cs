using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CsvHelper;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shares.Model.Indicators;

namespace Shares.Model.Test.Indicators
{
    [TestClass]
    public class AdxTests
    {
        [TestMethod]
        public void TestAdx()
        {
            using (var csvReader = new CsvReader(new StreamReader("Indicators/AdxTests.csv")))
            {
                var expectedData = csvReader.GetRecords<AdxDay>().ToList();

                var days = expectedData.Select(r => new ShareDay { Date = r.Date, High = r.High, Low = r.Low, Close = r.Close }).ToArray();
                var actual = new Adx().Calculate(days, new Adx.Parameters { Periods = 14 }).ToArray();

                var expected = expectedData.Where(r => r.Adx.HasValue)
                    .Select(r => new Adx.Point { DateTime = r.Date, Adx = r.Adx.Value, PositiveDi = r.PlusDi14.Value, NegativeDi = r.MinusDi14.Value }).ToArray();

                EnumerableAssert.AreEqual(expected, actual, new PointComparer<Adx.Point>(5, a => a.DateTime, a => a.Adx), printAll: false);
                EnumerableAssert.AreEqual(expected, actual, new PointComparer<Adx.Point>(5, a => a.DateTime, a => a.PositiveDi), printAll: false);
                EnumerableAssert.AreEqual(expected, actual, new PointComparer<Adx.Point>(5, a => a.DateTime, a => a.NegativeDi), printAll: false);
            }
        }

        public class AdxDay
        {
            public DateTime Date { get; set; }
            public decimal High { get; set; }
            public decimal Low { get; set; }
            public decimal Close { get; set; }
            public decimal? Tr { get; set; }
			public decimal? PlusDm1 { get; set; }
			public decimal? MinusDm1 { get; set; }
			public decimal? Tr14 { get; set; }
			public decimal? PlusDm14 { get; set; }
			public decimal? MinusDm14 { get; set; }
			public decimal? PlusDi14 { get; set; }
			public decimal? MinusDi14 { get; set; }
			public decimal? Di14Diff { get; set; }
			public decimal? Di14Sum { get; set; }
			public decimal? Dx { get; set; }
			public decimal? Adx { get; set; }
        }
    }

}