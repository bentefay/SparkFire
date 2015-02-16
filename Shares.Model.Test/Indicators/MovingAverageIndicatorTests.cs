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
    public class MovingAverageIndicatorTests
    {
        [TestMethod]
        public void SmaTest()
        {
            using (var csvReader = new CsvReader(new StreamReader("Indicators/MovingAverageTests.csv")))
            {
                var expectedData = csvReader.GetRecords<MovingAverageDay>().ToList();
                
                var days = expectedData.Select(r => new ShareDay { Date = r.Date, Close = r.Price }).ToArray();
                var actual = new Sma().Calculate(days, new Sma.Parameters { Periods = 10 }).ToArray();

                var expected = expectedData.Where(r => r.Sma.HasValue).Select(r => Point.With(r.Date, r.Sma.Value)).ToArray();

                CollectionAssert.AreEqual(expected, actual, new PointComparer(8));
            }
        }

        [TestMethod]
        public void EmaTest()
        {
            using (var csvReader = new CsvReader(new StreamReader("Indicators/MovingAverageTests.csv")))
            {
                var expectedData = csvReader.GetRecords<MovingAverageDay>().ToList();

                var days = expectedData.Select(r => new ShareDay { Date = r.Date, Close = r.Price }).ToArray();
                var actual = new Ema().Calculate(days, new Ema.Parameters { Periods = 10 }).ToArray();

                var expected = expectedData.Where(r => r.Ema.HasValue).Select(r => Point.With(r.Date, r.Ema.Value)).ToArray();

                CollectionAssert.AreEqual(expected, actual, new PointComparer(4));
            }
        }
    }

    public class MovingAverageDay
    {
        public DateTime Date { get; set; }
        public decimal Price { get; set; }
        public decimal? Sma { get; set; }
        public decimal? Ema { get; set; }
    }
}
