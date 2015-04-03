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
            Prices = s.Days.Select(d => Point.With(d.Date, d.Close)).ToArray();
        }

        public string MarketCode { get; set; }
        public string InstrumentCode { get; set; }
        public string CompanyName { get; set; }

        public Point<decimal>[] Prices { get; set; }
    }
}