using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.InteropServices;
using CsvHelper;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shares.Model.Indicators;

namespace Shares.Model.Test.Indicators
{
    [TestClass]
    public class AverageTrueRangeIndicatorTests
    {
        [TestMethod]
        public void TestNoPadding()
        {
            TestAll(checkPadding: false);
        }

        [TestMethod]
        public void TestPadding()
        {
            TestAll(checkPadding: true);
        }

        private static void TestAll(bool checkPadding)
        {
            using (var csvReader = new CsvReader(new StreamReader("Indicators/AverageTrueRangeIndicatorTests-All.csv")))
            {
                var expectedRecords = csvReader.GetRecords<AtrDay>().ToList();

                if (checkPadding)
                {
                    var firstNonNullAtr = expectedRecords.First(r => r.Atr != null).Atr;
                    foreach (var r in expectedRecords.Where(r => r.Atr == null))
                        r.Atr = firstNonNullAtr;
                }

                var shareDays = expectedRecords
                    .Select(r => new ShareDay {Date = r.Date, High = r.High, Low = r.Low, Close = r.Close})
                    .ToArray();

                var parameters = new AtrParameters();
                var actualAtrCollection =
                    new Atr().Calculate(shareDays, parameters, 0, pad: checkPadding).ToList();

                var expectedAtrCollection =
                    expectedRecords.Where(r => r.Atr != null).Select(r => Point.With(r.Date, r.Atr.Value)).ToList();

                CollectionAssert.AreEqual(expectedAtrCollection, actualAtrCollection, new PointComparer(8));
            }
        }

        public class AtrDay
        {
            public DateTime Date { get; set; }
            public decimal High { get; set; }
            public decimal Low { get; set; }
            public decimal Close { get; set; }
            public decimal? Atr { get; set; }
        }
    }
}
