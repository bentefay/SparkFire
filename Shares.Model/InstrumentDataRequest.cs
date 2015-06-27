using System;

namespace Shares.Model
{
    public class InstrumentDataRequest : ICacheable
    {
        public string InstrumentCode { get; set; }
        public ShareAggregateType AggregateType { get; set; }
        public int AggregateSize { get; set; }
        public bool IsRelative { get; set; }

        public InstrumentDataRequest()
        {
            AggregateType = ShareAggregateType.Day;
            AggregateSize = 1;
            IsRelative = true;
        }

        public object ToCacheKey()
        {
            return String.Format("{0} {1} {2} {3}", InstrumentCode, AggregateType, AggregateSize, IsRelative);
        }
    }
}