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
        private const string EodFilePath = @"C:\Data\Dropbox\Git\ASX";

        public ShareDto Get(string instrumentCode)
        {
            var fullPath = Path.Combine(EodFilePath, Path.ChangeExtension(instrumentCode, "eod"));

            var parser = new EodParser();
            var share = parser.ParseFile(fullPath);

            return new ShareDto(share);
        }

        public List<string> GetAllInstrumentCodes()
        {
            var instrumentCodes = Directory.GetFiles(EodFilePath, "*.eod").Select(Path.GetFileNameWithoutExtension).ToList();
            return instrumentCodes;
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