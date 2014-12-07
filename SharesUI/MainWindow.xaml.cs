using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Windows;
using Shares.Model.Parsers;

namespace SharesUI
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();

            var csvPath = @"..\..\..\..\CheckASX";
            var eodPath = @"..\..\..\..\ASX";

            var viewModels = new List<FileViewModel>();

            foreach (var file in Directory.GetFiles(csvPath, "*.csv"))
            {
                var instrumentCode = Path.GetFileNameWithoutExtension(file);
                var viewModel = new FileViewModel(csvPath, eodPath, instrumentCode);
                viewModels.Add(viewModel);
            }

            DataContext = viewModels;

            WindowState = WindowState.Maximized;
        }   
    }

    public class FileViewModel
    {
        public FileViewModel(string csvPath, string eodPath, string instrumentCode)
        {
            CheckFile(csvPath, eodPath, instrumentCode);
        }

        public string InstrumentCode { get; set; }
        public string Text { get; set; }

        private void CheckFile(string csvPath, string eodPath, string instrumentCode)
        {
            var eod = new EodParser();
            var csv = new CsvParser();

            var eodFile = Path.ChangeExtension(Path.Combine(eodPath, instrumentCode), ".eod");
            var csvFile = Path.ChangeExtension(Path.Combine(csvPath, instrumentCode), ".csv");

            var eodShare = eod.ParseFile(eodFile);
            var csvShare = csv.ParseFile(csvFile);

            var output = new StringBuilder();
            output.AppendLine(FormatAsHex(eodShare.HeaderBytes));
            output.AppendLine();
            output.AppendLine(eodShare.MarketCode);
            output.AppendLine(eodShare.InstrumentCode);
            output.AppendLine(eodShare.CompanyName);
            output.AppendLine(eodShare.Unknown1.ToString("000000"));
            output.AppendLine(eodShare.StartDate.ToString("yyyyMMdd"));
            output.AppendLine(eodShare.EndDate.ToString("yyyyMMdd"));
            output.AppendLine(eodShare.RowCount.ToString("D"));
            output.AppendLine(eodShare.Info1.ToString("000000"));
            output.AppendLine(eodShare.StrikePrice.ToString());
            output.AppendLine(FormatAsHex(eodShare.InfoRemaining));
            output.AppendLine(FormatAs(eodShare.InfoRemaining, "int32", "int32", "int32", "int32", "int32", "int32", "int32"));
            output.AppendLine(eodShare.Details);
            output.AppendLine();

            foreach (var pair in eodShare.Days.Zip(csvShare.Days, (day, dayCsv) => new { Day = day, DayCsv = dayCsv }))
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
                output.Append(" | ");
                output.Append(day.ToString());
                output.Append(" | ");
                output.Append(csvDay.ToString());
                output.AppendLine();
            }

            InstrumentCode = eodShare.InstrumentCode;
            Text = output.ToString();
        }

        private static string FormatAs(byte[] bytes, params string[] types)
        {
            var formatted = new List<string>();

            using (var reader = new BinaryReader(new MemoryStream(bytes)))
            {
                foreach (var type in types)
                {
                    switch (type.ToLower())
                    {
                        case "int32":
                            formatted.Add(reader.ReadInt32().ToString("0000000000"));
                            break;
                        case "single":
                            formatted.Add(reader.ReadSingle().ToString());
                            break;
                        case "double":
                            formatted.Add(reader.ReadDouble().ToString());
                            break;
                        case "decimal":
                            formatted.Add(reader.ReadDecimal().ToString());
                            break;
                        default:
                            throw new Exception();
                    }
                }
            }

            return String.Join(" ", formatted);
        }

        private static string FormatAsHex(byte[] bytes, int? width = null)
        {
            var bytesAsHex = bytes.Select(b => b.ToString("X").PadLeft(2, '0'));
            if (width != null)
            {
                var grouped = bytesAsHex
                    .Select((b, i) => new {Index = (i / width.Value), Byte = b})
                    .GroupBy(p => p.Index);
                return String.Join(Environment.NewLine, grouped.Select(g => String.Join(" ", g.Select(p => p.Byte))));
            }
            else
            {
                return String.Join(" ", bytesAsHex);
            }
        }

        public static void Assert(bool condition)
        {
            if (!condition)
                throw new Exception();
        }
    }
}