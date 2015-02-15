using System;
using System.Linq;
using Shares.Model;

namespace Shares.Web.Controllers
{
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
        public Decimal[] Open { get; set; }
        public Decimal[] High { get; set; }
        public Decimal[] Low { get; set; }
        public Decimal[] Close { get; set; }
        public UInt32[] Volume { get; set; }
        public UInt16[] OpenInt { get; set; }
    }
}