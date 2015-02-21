using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Caching;
using System.Web.Http;
using Shares.Model;
using Shares.Model.Indicators;
using Shares.Model.Indicators.Metadata;
using Shares.Model.Parsers;
using Shares.Web.Utility;

namespace Shares.Web.Controllers
{
    public class SharesController : ApiController
    {
        private static readonly string[] _eodFilePaths = { @"C:\Data\Dropbox\Git\ASX", @"D:\Mesh\Dropbox\Git\ASX" };
        private static readonly MemoryCache _memoryCache = MemoryCache.Default;

        [Route("api/instrumentCodes")]
        public List<string> GetAllInstrumentCodes()
        {
            var eodFilePath = GetEodFilePath();

            var instrumentCodes = Directory.GetFiles(eodFilePath, "*.eod").Select(Path.GetFileNameWithoutExtension).ToList();

            return instrumentCodes;
        }

        [Route("api/instrumentData")]
        public ShareDto Get([FromUri] ShareDataRequest request)
        {
            if (request == null || request.InstrumentCode == null)
                throw new ArgumentException();

            return new ShareDto(GetShareData(request));
        }

        private readonly IndicatorInfoAggregator _indicatorInfoAggregator = new IndicatorInfoAggregator()
            .AddIndicator<Atr, Atr.Parameters>("ATR")
            .AddIndicator<Macd, Macd.Parameters>("MACD")
            .AddIndicator<MacdSignalLine, MacdSignalLine.Parameters>("MACD Signal Line", "MACD")
            .AddIndicator<Macdh, Macdh.Parameters>("MACDH")
            .AddIndicator<Adx, Adx.Parameters>("ADX");

        [Route("api/indicators")]
        public List<IndicatorInfo> GetAllIndicators()
        {
            return _indicatorInfoAggregator.GetIndicatorInfos();
        }

        [Route("api/indicator/atr")]
        public List<Point<Decimal>> GetAtrIndicator([FromUri] ShareDataRequest request, [FromUri] Atr.Parameters parameters)
        {
            var share = GetShareData(request);

            return new Atr().Calculate(share.Days, parameters, 0, pad: true).ToList();
        }

        [Route("api/indicator/macd")]
        public List<Point<Decimal>> GetMacdIndicator([FromUri] ShareDataRequest request, [FromUri] Macd.Parameters parameters)
        {
            var share = GetShareData(request);

            return new Macd().Calculate(share.Days, parameters).ToList();
        }

        [Route("api/indicator/macdh")]
        public List<Point<Decimal>> GetMacdhIndicator([FromUri] ShareDataRequest request, [FromUri] Macdh.Parameters parameters)
        {
            var share = GetShareData(request);

            return new Macdh().Calculate(share.Days, parameters).ToList();
        }

        [Route("api/indicator/adx")]
        public List<Adx.Point> GetAdxIndicator([FromUri] ShareDataRequest request, [FromUri] Adx.Parameters parameters)
        {
            var share = GetShareData(request);

            return new Adx().Calculate(share.Days, parameters).ToList();
        }

        private string GetEodFilePath()
        {
            foreach (var filePath in _eodFilePaths)
                if (Directory.Exists(filePath))
                    return filePath;

            throw new Exception("None of the specified paths exist.");
        }

        private Share GetShareData(ShareDataRequest request)
        {
            return _memoryCache.GetOrAdd(request, () =>
            {
                var eodFilePath = GetEodFilePath();

                var fullPath = Path.Combine(eodFilePath, Path.ChangeExtension(request.InstrumentCode, "eod"));

                var parser = new EodParser();
                var share = parser.ParseFile(fullPath);

                share.Aggregate(request.AggregateType, request.AggregateSize, request.IsRelative, DateTime.Now);

                return share;
            });
        }
    }
}