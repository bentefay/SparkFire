using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Reflection;

namespace Shares.Model.Indicators.Metadata
{
    public class IndicatorInfoAggregator
    {
        private readonly List<IndicatorInfo> _indicatorInfos = new List<IndicatorInfo>(); 

        public IndicatorInfoAggregator AddIndicator<TIndicator, TIndicatorParameters>(string displayName = null, string graphGroup = null)
        {
            var indicatorInfo = new IndicatorInfo();

            var indicatorType = typeof (TIndicator);
            var name = indicatorType.Name;
            name = name.Replace("Indicator", "");

            indicatorInfo.Name = name;
            indicatorInfo.GraphGroup = graphGroup ?? name;
            indicatorInfo.DisplayName = displayName ?? name;
            indicatorInfo.ParameterInfos = new List<IndicatorParameterInfo>();

            foreach (var parameter in typeof(TIndicatorParameters).GetProperties())
            {
                var parameterInfo = new IndicatorParameterInfo();

                Do(parameter.GetCustomAttribute<DescriptionAttribute>(), a => parameterInfo.Description = a.Description);
                Do(parameter.GetCustomAttribute<DisplayNameAttribute>(), a => parameterInfo.DisplayName = a.DisplayName);
                parameterInfo.Name = parameter.Name;
                parameterInfo.Type = parameter.PropertyType.Name;

                indicatorInfo.ParameterInfos.Add(parameterInfo);
            }

            _indicatorInfos.Add(indicatorInfo);

            return this;
        }

        private static void Do<T>(T attribute, Action<T> action) where T : class
        {
            if (attribute != null)
                action(attribute);
        }

        public List<IndicatorInfo> GetIndicatorInfos()
        {
            return _indicatorInfos;
        } 
    }
}