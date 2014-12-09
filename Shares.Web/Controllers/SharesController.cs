using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Http;
using Shares.Model;
using Shares.Model.Parsers;

namespace Shares.Web.Controllers
{
    public class SharesController : ApiController
    {
        private static readonly string[] _eodFilePaths = { @"C:\Data\Dropbox\Git\ASX", @"D:\Mesh\Dropbox\Git\ASX" };

        public ShareDto Get(string instrumentCode)
        {
            var eodFilePath = GetEodFilePath();

            var fullPath = Path.Combine(eodFilePath, Path.ChangeExtension(instrumentCode, "eod"));

            var parser = new EodParser();
            var share = parser.ParseFile(fullPath);

            return new ShareDto(share);
        }

        public List<string> GetAllInstrumentCodes()
        {
            var eodFilePath = GetEodFilePath();

            var instrumentCodes = Directory.GetFiles(eodFilePath, "*.eod").Select(Path.GetFileNameWithoutExtension).ToList();

            return instrumentCodes;
        }

        private string GetEodFilePath()
        {
            foreach (var filePath in _eodFilePaths)
                if (Directory.Exists(filePath))
                    return filePath;

            throw new Exception("None of the specified paths exist.");
        }

        public class ShareDto
        {
            public ShareDto(Share s)
            {
                MarketCode = s.MarketCode;
                InstrumentCode = s.InstrumentCode;
                CompanyName = s.CompanyName;
                Date = s.Days.Select(d => d.Date).ToArray();
                Open = s.Days.Select(d => d.Open).ToArray();
                High = s.Days.Select(d => d.High).ToArray();
                Low = s.Days.Select(d => d.Low).ToArray();
                Close = s.Days.Select(d => d.Close).ToArray();
                Volume = s.Days.Select(d => d.Volume).ToArray();
                OpenInt = s.Days.Select(d => d.OpenInt).ToArray();
            }

            public string MarketCode { get; set; }
            public string InstrumentCode { get; set; }
            public string CompanyName { get; set; }

            public DateTime[] Date { get; set; }
            public Single[] Open { get; set; }
            public Single[] High { get; set; }
            public Single[] Low { get; set; }
            public Single[] Close { get; set; }
            public Int32[] Volume { get; set; }
            public UInt16[] OpenInt { get; set; }
        }
    }
}