using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;

namespace Shares.Model.Indicators.Metadata
{
    public class IndicatorInfoAggregator
    {
        private readonly List<IndicatorInfo> _indicatorInfos = new List<IndicatorInfo>(); 

        public IndicatorInfoAggregator AddIndicator<TIndicator, TIndicatorParameters, TPoint>(string displayName = null, string graphGroup = null) 
            where TIndicatorParameters : new()
        {
            var indicatorInfo = new IndicatorInfo();

            var indicatorType = typeof (TIndicator);
            var name = indicatorType.Name;
            name = name.Replace("Indicator", "");
            name = ToCamelCase(name);

            indicatorInfo.Id = name;
            indicatorInfo.GraphGroup = graphGroup ?? name;
            indicatorInfo.DisplayName = displayName ?? name;
            indicatorInfo.DefaultParameterObject = new TIndicatorParameters();
            indicatorInfo.ParameterInfos = new List<IndicatorParameterInfo>();
            indicatorInfo.FieldNames = typeof(TPoint).GetProperties().Select(p => ToCamelCase(p.Name)).ToList();

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

        private static string ToCamelCase(string name)
        {
            return Char.ToLowerInvariant(name[0]) + name.Substring(1);
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