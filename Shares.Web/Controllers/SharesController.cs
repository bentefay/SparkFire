using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Http;
using Shares.Model;
using Shares.Model.Indicators;
using Shares.Model.Indicators.Metadata;
using Shares.Model.Parsers;

namespace Shares.Web.Controllers
{
    public class SharesController : ApiController
    {
        private static readonly string[] _eodFilePaths = { @"C:\Data\Dropbox\Git\ASX", @"D:\Mesh\Dropbox\Git\ASX" };

        [Route("api/instrumentData")]
        public ShareDto Get([FromUri] ShareDataRequest request)
        {
            if (request == null || request.InstrumentCode == null)
                throw new ArgumentException();

            return new ShareDto(GetShareData(request));
        }

        private Share GetShareData([FromUri] ShareDataRequest request)
        {
            var eodFilePath = GetEodFilePath();

            var fullPath = Path.Combine(eodFilePath, Path.ChangeExtension(request.InstrumentCode, "eod"));

            var parser = new EodParser();
            var share = parser.ParseFile(fullPath);

            share.Aggregate(request.AggregateType, request.AggregateSize, request.IsRelative, DateTime.Now);

            return share;           
        }

        private readonly IndicatorInfoAggregator _indicatorInfoAggregator = new IndicatorInfoAggregator()
            .AddIndicator<AverageTrueRangeIndicator, AverageTrueRangeIndicatorParameters>("ATR");

        [Route("api/indicators")]
        public List<IndicatorInfo> GetAllIndicators()
        {
            return _indicatorInfoAggregator.GetIndicatorInfos();
        }

        [Route("api/indicator/averageTrueRange")]
        public List<Point<Decimal>> GetAverageTrueRangeIndicator([FromUri] ShareDataRequest request, [FromUri] AverageTrueRangeIndicatorParameters parameters)
        {
            var share = GetShareData(request);

            return new AverageTrueRangeIndicator().Calculate(share.Days, parameters, 0, pad: true).ToList();
        }

        [Route("api/instrumentCodes")]
        public List<string> GetAllInstrumentCodes()
        {
            var eodFilePath = GetEodFilePath();

            var instrumentCodes = Directory.GetFiles(eodFilePath, "*.eod").Select(Path.GetFileNameWithoutExtension).ToList();

            return instrumentCodes;
        }

        private string GetEodFilePath()
        {
            foreach (var filePath in _eodFilePaths)
                if (Directory.Exists(filePath))
                    return filePath;

            throw new Exception("None of the specified paths exist.");
        }

        public class ShareDataRequest
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
            public Decimal[] Open { get; set; }
            public Decimal[] High { get; set; }
            public Decimal[] Low { get; set; }
            public Decimal[] Close { get; set; }
            public UInt32[] Volume { get; set; }
            public UInt16[] OpenInt { get; set; }
        }
    }
}