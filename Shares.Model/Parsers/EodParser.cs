using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace Shares.Model.Parsers
{
    public class EodParser
    {
        public Share ParseFile(string filePath)
        {
            using (var fileReader = new FileStream(filePath, FileMode.Open))
            using (var r = new BinaryReader(fileReader, Encoding.UTF8))
            {
                var share = new Share();

                share.Preamble = r.ReadBytes(2);
                share.Description = ReadString(r);
                
                // 60 bytes of other info
                share.Unknown1 = r.ReadInt32();
                share.StartDate = ReadDate(r);
                share.EndDate = ReadDate(r);
                share.Info = r.ReadBytes(40);

                // All zeroes (0x20)
                share.Zeros = r.ReadBytes(1152);

                // Each row is 34 bytes.
                var row = 0;

                var days = new List<ShareDay>();

                while (r.PeekChar() != -1)
                {
                    var day = new ShareDay();

                    day.Flag = r.ReadByte();
                    day.Unknown1 = r.ReadByte();
                    day.Date = ReadDate(r);
                    day.Open = r.ReadSingle();
                    day.High = r.ReadSingle();
                    day.Low = r.ReadSingle();
                    day.Close = r.ReadSingle();
                    day.Volume = r.ReadInt32();
                    day.OpenInt = r.ReadUInt16();
                    day.Unknown2 = r.ReadBytes(2);

                    days.Add(day);

                    row++;
                }

                share.Days = days.ToArray();

                return share;
            }
        }

        private static string ReadString(BinaryReader reader)
        {
            var buffer = new List<byte>();

            while (reader.PeekChar() != 1)
                buffer.Add(reader.ReadByte());

            var description = Encoding.UTF8.GetString(buffer.ToArray());
            return description;
        }

        private DateTime ReadDate(BinaryReader r)
        {
            var daysSince1900 = r.ReadDouble();
            var date = new DateTime(1900, 1, 1) + TimeSpan.FromDays(daysSince1900) - TimeSpan.FromDays(2);
            return date;
        }
    }
}