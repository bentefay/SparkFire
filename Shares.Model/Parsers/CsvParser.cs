using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;

namespace Shares.Model.Parsers
{
    public class CsvParser
    {
        public Share ParseFile(string filePath)
        {
            using (var csv = new StreamReader(filePath))
            {
                var share = new Share();
                var row = 0;

                var days = new List<ShareDay>();

                while (!csv.EndOfStream)
                {
                    var cells = csv.ReadLine().Split(',');
                    Debug.Assert(cells.Length == 9);

                    var day = new ShareDay();

                    day.Date = DateTime.ParseExact(cells[2], "yyyyMMdd", CultureInfo.CurrentCulture);
                    day.Open = Single.Parse(cells[3]);
                    day.High = Single.Parse(cells[4]);
                    day.Low = Single.Parse(cells[5]);
                    day.Close = Single.Parse(cells[6]);
                    day.Volume = Int32.Parse(cells[7]);
                    day.OpenInt = UInt16.Parse(cells[8]);

                    days.Add(day);
                    row++;
                }

                share.Days = days.ToArray();

                return share;
            }
        }
    }
}