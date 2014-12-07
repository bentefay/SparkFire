using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Windows;
using Shares.Model.Parsers;

namespace SharesUI
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();

            var csvPath = @"..\..\..\..\CheckASX";
            var eodPath = @"..\..\..\..\ASX";
            var instrumentCode = "NAB";

            var output = CheckFile(csvPath, eodPath, instrumentCode);

            Data.Text = output.ToString();
        }

        private static StringBuilder CheckFile(string csvPath, string eodPath, string instrumentCode)
        {
            var eod = new EodParser();
            var csv = new CsvParser();

            var eodFile = Path.ChangeExtension(Path.Combine(eodPath, instrumentCode), ".eod");
            var csvFile = Path.ChangeExtension(Path.Combine(csvPath, instrumentCode), ".csv");

            var share = eod.ParseFile(eodFile);
            var csvShare = csv.ParseFile(csvFile);

            var output = new StringBuilder();
            output.AppendLine(FormatAsHex(share.HeaderBytes));
            output.AppendLine();
            output.AppendLine(share.CompanyName);
            output.AppendLine(share.InstrumentCode);
            output.AppendLine(share.MarketCode);
            output.AppendLine(share.Days.Length.ToString("D"));
            output.AppendLine(share.StartDate.ToString("yyyyMMdd"));
            output.AppendLine(share.EndDate.ToString("yyyyMMdd"));
            output.AppendLine();

            foreach (var pair in share.Days.Zip(csvShare.Days, (day, dayCsv) => new {Day = day, DayCsv = dayCsv}))
            {
                var day = pair.Day;
                var csvDay = pair.DayCsv;

                Assert(day.Date == csvDay.Date);
                Assert(day.Open == csvDay.Open);
                Assert(day.High == csvDay.High);
                Assert(day.Low == csvDay.Low);
                Assert(day.Close == csvDay.Close);
                Assert(day.Volume == csvDay.Volume);
                Assert(day.OpenInt == csvDay.OpenInt);

                output.Append(day.Row.ToString("0000"));
                output.Append(day.ToString());
                output.Append(" | ");
                output.Append(csvDay.ToString());
                output.AppendLine();
            }
            return output;
        }

        private static string FormatAsHex(byte[] bytes)
        {
            var bytesAsHex = bytes.Select(b => b.ToString("X").PadLeft(2, '0'));
            return String.Join(" ", bytesAsHex);
        }

        public static void Assert(bool condition)
        {
            if (!condition)
                throw new Exception();
        }
    }
}