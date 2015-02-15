using System;
using Shares.Model;
using Shares.Web.Utility;

namespace Shares.Web.Controllers
{
    public class ShareDataRequest : ICacheable
    {
        public string InstrumentCode { get; set; }
        public ShareAggregateType AggregateType { get; set; }
        public int AggregateSize { get; set; }
        public bool IsRelative { get; set; }

        public ShareDataRequest()
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