using System;

namespace Shares.Model
{
    public class Share
    {
        public byte[] HeaderBytes { get; set; }
        public Byte[] Preamble { get; set; }
        public string MarketCode { get; set; }
        public string InstrumentCode { get; set; }
        public string CompanyName { get; set; }
        public Int32 Unknown1 { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Byte[] Info { get; set; }
        public Byte[] Empty { get; set; }
        public ShareDay[] Days { get; set; }
    }
}