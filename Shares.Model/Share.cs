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
        public UInt32 RowCount { get; set; }
        public int Info1 { get; set; }
        public float StrikePrice { get; set; }
        public Byte[] InfoRemaining { get; set; }
        public string Details { get; set; }
        public ShareDay[] Days { get; set; }
    }
}