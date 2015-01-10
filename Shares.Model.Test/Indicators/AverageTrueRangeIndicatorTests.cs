using System;
using System.Collections;
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
        public void TestAll()
        {
            using (var csvReader = new CsvReader(new StreamReader("Indicators/AverageTrueRangeIndicatorTests-All.csv")))
            {
                var actualRecords = csvReader.GetRecords<AtrDay>().ToList();
                var shareDays = actualRecords
                    .Select(r => new ShareDay {Date = r.Date, High = r.High, Low = r.Low, Close = r.Close})
                    .ToArray();

                var parameters = new AverageTrueRangeIndicatorParameters();
                var actualAtrCollection = new AverageTrueRangeIndicator().Calculate(shareDays, 0, parameters).ToList();
                
                var expectedAtrCollection = actualRecords.Where(r => r.Atr != null).Select(r => Point.With(r.Date, r.Atr.Value)).ToList();

                CollectionAssert.AreEqual(expectedAtrCollection, actualAtrCollection, new PointComparer(8));
            }

        }

        public class PointComparer : IComparer
        {
            private readonly int _multiplier;

            public PointComparer(int decimalAccuracy)
            {
                _multiplier = (int)Math.Pow(10, decimalAccuracy);
            }

            public bool Equal(Point<decimal> x, Point<decimal> y)
            {
                if (!x.DateTime.Equals(y.DateTime)) return false;

                return (int)(x.Value * _multiplier) == (int)(y.Value * _multiplier);
            }

            public int Compare(object x, object y)
            {
                return Equal((Point<decimal>)x, (Point<decimal>)y) ? 0 : -1;
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
