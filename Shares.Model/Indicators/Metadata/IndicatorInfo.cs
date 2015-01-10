using System.Collections.Generic;

namespace Shares.Model.Indicators.Metadata
{
    public class IndicatorInfo
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string GraphGroup { get; set; }
        public List<IndicatorParameterInfo> ParameterInfos { get; set; }
        public object DefaultParameterObject { get; set; }
    }
}