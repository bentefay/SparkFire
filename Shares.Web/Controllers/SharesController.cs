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
            .AddIndicator<Price, object, Price.Point>("Price")
            .AddIndicator<Volume, object, Point<uint>>("Volume")
            .AddIndicator<Atr, Atr.Parameters, Point<Decimal>>("ATR")
            .AddIndicator<MacdSignalLine, MacdSignalLine.Parameters, MacdSignalLine.Point>("MACD Signal Line", "macd")
            .AddIndicator<Macdh, Macdh.Parameters, Point<Decimal>>("MACD")
            .AddIndicator<Adx, Adx.Parameters, Adx.Point>("ADX")
            .AddIndicator<PercentR, PercentR.Parameters, Point<Decimal>>("Percent R")
            .AddIndicator<TradingBand, TradingBand.Parameters, TradingBand.Point>("Trading Band", "price");

        [Route("api/indicators")]
        public List<IndicatorInfo> GetAllIndicators()
        {
            return _indicatorInfoAggregator.GetIndicatorInfos();
        }

        [Route("api/indicator/price")]
        public List<Price.Point> GetPriceIndicator([FromUri] ShareDataRequest request)
        {
            var share = GetShareData(request);

            return Price.Calculate(share.Days).ToList();
        }

        [Route("api/indicator/volume")]
        public List<Point<uint>> GetVolumeIndicator([FromUri] ShareDataRequest request)
        {
            var share = GetShareData(request);

            return Volume.Calculate(share.Days).ToList();
        }

        [Route("api/indicator/atr")]
        public List<Point<Decimal>> GetAtrIndicator([FromUri] ShareDataRequest request, [FromUri] Atr.Parameters parameters)
        {
            var share = GetShareData(request);

            return new Atr().Calculate(share.Days, parameters, 0, pad: true).ToList();
        }

        [Route("api/indicator/macdSignalLine")]
        public List<MacdSignalLine.Point> GetMacdSignalLineIndicator([FromUri] ShareDataRequest request, [FromUri] MacdSignalLine.Parameters parameters)
        {
            var share = GetShareData(request);

            return new MacdSignalLine().Calculate(share.Days, parameters).ToList();
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

        [Route("api/indicator/percentr")]
        public List<Point<Decimal>> GetPercentRIndicator([FromUri] ShareDataRequest request, [FromUri] PercentR.Parameters parameters)
        {
            var share = GetShareData(request);

            return new PercentR().Calculate(share.Days, parameters).ToList();
        }

        [Route("api/indicator/tradingband")]
        public List<TradingBand.Point> GetTradingBandIndicator([FromUri] ShareDataRequest request, [FromUri] TradingBand.Parameters parameters)
        {
            var share = GetShareData(request);

            return new TradingBand().Calculate(share.Days, parameters).ToList();
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

        private string GetEodFilePath()
        {
            foreach (var filePath in _eodFilePaths)
                if (Directory.Exists(filePath))
                    return filePath;

            throw new Exception("None of the specified paths exist.");
        }
    }
}