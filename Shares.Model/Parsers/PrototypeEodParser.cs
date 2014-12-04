using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;

namespace Shares.Model.Parsers
{
    public class PrototypeEodParser
    {
        public string ParseFile()
        {
            var buffer = new List<byte>();
            var s = new StringBuilder();

            using (var csv = new StreamReader("nab.csv"))
            using (var fileReader = new FileStream("NAB.EOD", FileMode.Open))
            using (var reader = new BinaryReader(fileReader, Encoding.UTF8))
            {
                csv.ReadLine();

                var preamble = reader.ReadBytes(2);

                while (reader.PeekChar() != 1)
                    buffer.Add(reader.ReadByte());

                var description = System.Text.Encoding.UTF8.GetString(buffer.ToArray());

                s.AppendLine(description);
                s.AppendLine();

                buffer.Clear();

                var info = reader.ReadBytes(60);
                var zeros = reader.ReadBytes(1152);

                using (var r = GetReader(info))
                {
                    var f1 = r.ReadInt32();
                    var f2 = ReadDate(r);
                    var f3 = ReadDate(r);

                    s.AppendLine(Hex(info));
                    s.AppendLine(String.Format("{0}  {1}  {2}", f1, f2, f3));
                    s.AppendLine();
                }

                s.AppendLine(Hex(zeros));
                s.AppendLine();

                var row = 0;
                var character = 0;

                while (reader.PeekChar() != -1)
                {
                    var cells = csv.ReadLine().Split(',');
                    Debug.Assert(cells.Length == 10);

                    var csvDate = DateTime.ParseExact(cells[2], "yyyyMMdd", CultureInfo.CurrentCulture);
                    var csvOpen = Single.Parse(cells[3]);
                    var csvHigh = Single.Parse(cells[4]);
                    var csvLow = Single.Parse(cells[5]);
                    var csvClose = Single.Parse(cells[6]);
                    var csvVolume = Single.Parse(cells[7]);
                    var csvOpenInt = Int32.Parse(cells[8]);

                    var bytes = reader.ReadBytes(34);

                    using (var r = GetReader(bytes))
                    {
                        var flag = r.ReadByte();
                        var unknown1 = r.ReadByte();
                        var date = ReadDate(r);
                        var open = r.ReadSingle();
                        var high = r.ReadSingle();
                        var low = r.ReadSingle();
                        var close = r.ReadSingle();
                        var volume = r.ReadInt32();
                        var openInt = r.ReadUInt16();
                        var unknown2 = r.ReadByte();

                        var fields = new[]
                        {
                            character.ToString("000000"),
                            row.ToString("00000") + "|",
                            Hex(bytes.Skip(6).ToArray()) + "|",
                            csvDate.ToString("yyyyMMdd"),
                            csvOpen.ToString("00.000"),
                            csvHigh.ToString("00.000"),
                            csvLow.ToString("00.000"),
                            csvClose.ToString("00.000"),
                            csvVolume.ToString("00000000"),
                            csvOpenInt.ToString("00000") + "|",
                            date.ToString("yyyyMMdd"),
                            open.ToString("00.000"),
                            high.ToString("00.000"),
                            low.ToString("00.000"),
                            close.ToString("00.000"),
                            volume.ToString("00000000"),
                            openInt.ToString("00000"),
                        };

                        Debug.Assert(csvDate == date);
                        Debug.Assert(csvOpen == open);
                        Debug.Assert(csvHigh == high);
                        Debug.Assert(csvLow == low);
                        Debug.Assert(csvClose == close);
                        Debug.Assert(csvVolume == volume);
                        Debug.Assert(csvOpenInt == openInt);

                        s.AppendLine(String.Join("  ", fields));

                        row++;
                        character = row*34;
                    }
                }

                return s.ToString();
            }
        }

        private static BinaryReader GetReader(byte[] bytes)
        {
            return new BinaryReader(new MemoryStream(bytes));
        }

        private static string Hex(byte[] bytes)
        {
            var bytesAsHex = bytes.Select(b => b.ToString("X").PadLeft(2, '0'));
            return String.Join(" ", bytesAsHex);
        }

        private static void ReadEmpty(BinaryReader r, int bytes)
        {
            var empty = r.ReadBytes(bytes);
            Debug.Assert(empty.Sum(x => x) == 0);
        }

        private DateTime ReadDate(BinaryReader r)
        {
            var daysSince1900 = r.ReadDouble();
            var date = new DateTime(1900, 1, 1) + TimeSpan.FromDays(daysSince1900) - TimeSpan.FromDays(2);
            return date;
        }
    }
}