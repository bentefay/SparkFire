using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;

namespace Shares.Model.Parsers
{
    public class EodParser
    {
        public Share ParseFile(string filePath)
        {
            using (var fileStream = new FileStream(filePath, FileMode.Open))
            using (var r = GetReader(fileStream))
            {
                return ReadShare(r);
            }
        }

        private Share ReadShare(BinaryReader reader)
        {
            var share = new Share();

            ReadHeader(reader, share);

            var row = 0;
            var days = new List<ShareDay>();

            while (reader.PeekChar() != -1)
            {
                var day = ReadDay(row, reader);
                days.Add(day);
                row++;
            }

            Assert(days.Count == share.RowCount);

            share.Days = days.ToArray();

            return share;
        }

        private void ReadHeader(BinaryReader reader, Share share)
        {
            var headerBytes = reader.ReadBytes(1304);
            using (var r = GetReader(new MemoryStream(headerBytes)))
            {
                share.HeaderBytes = headerBytes;

                share.Preamble = r.ReadBytes(2);
                share.MarketCode = ReadString(r, 10).TrimEnd();
                share.InstrumentCode = ReadString(r, 20).TrimEnd();
                share.CompanyName = ReadString(r, 60).TrimEnd();

                // 60 bytes of other info
                share.Unknown1 = r.ReadInt32();
                share.StartDate = ReadDate(r);
                share.EndDate = ReadDate(r);
                share.RowCount = r.ReadUInt32();
                share.Info1 = r.ReadInt32();
                share.StrikePrice = r.ReadSingle();
                share.InfoRemaining = r.ReadBytes(28);

                // All = 0x20
                share.Details = ReadString(r, 1152).Trim();
            }
        }

        private ShareDay ReadDay(int row, BinaryReader reader)
        {
            var bytes = reader.ReadBytes(34);

            using (var r = GetReader(new MemoryStream(bytes)))
            {
                var day = new ShareDay();

                day.Bytes = bytes;
                day.Row = row;
                day.Tf = ReadTf(r);
                day.Unknown1 = r.ReadByte();
                Assert(day.Unknown1 == 0);
                day.Date = ReadDate(r);
                day.Open = r.ReadSingle();
                day.High = r.ReadSingle();
                day.Low = r.ReadSingle();
                day.Close = r.ReadSingle();
                day.Volume = r.ReadInt32();
                day.OpenInt = r.ReadUInt16();
                day.Unknown2 = r.ReadBytes(2);
                Assert(day.Unknown2.Sum(b => b) == 0);

                return day;
            }
        }

        private static BinaryReader GetReader(Stream stream)
        {
            return new BinaryReader(stream, Encoding.UTF8);
        }

        private static Tf ReadTf(BinaryReader r)
        {
            var tf = r.ReadByte();
            switch (tf)
            {
                case 0:
                case 4:
                    return Tf.NotTraded;
                case 1:
                    return Tf.Traded;
                case 2:
                    return Tf.Ph;
                default:
                    return Tf.Unknown;
            }
        }

        private static void Assert(bool condition)
        {
            if (!condition)
                throw new Exception("Assert failed");
        }

        private static string ReadString(BinaryReader reader)
        {
            var buffer = new List<byte>();

            while (reader.PeekChar() != 1)
                buffer.Add(reader.ReadByte());

            var description = Encoding.UTF8.GetString(buffer.ToArray());
            return description;
        }

        private static string ReadString(BinaryReader reader, int bytes)
        {
            var description = Encoding.UTF8.GetString(reader.ReadBytes(bytes));
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