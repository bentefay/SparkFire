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
        private static readonly InstrumentDataRepo _instrumentDataRepo = new InstrumentDataRepo();

        [Route("api/instrumentCodes")]
        public List<string> GetAllInstrumentCodes()
        {
            return _instrumentDataRepo.GetAllInstrumentCodes();
        }

        [Route("api/instrumentData")]
        public ShareDto Get([FromUri] InstrumentDataRequest request)
        {
            if (request == null || request.InstrumentCode == null)
                throw new ArgumentException();

            return new ShareDto(_instrumentDataRepo.GetShareData(request));
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
        public List<Price.Point> GetPriceIndicator([FromUri] InstrumentDataRequest request)
        {
            var share = _instrumentDataRepo.GetShareData(request);

            return Price.Calculate(share.Days).ToList();
        }

        [Route("api/indicator/volume")]
        public List<Point<uint>> GetVolumeIndicator([FromUri] InstrumentDataRequest request)
        {
            var share = _instrumentDataRepo.GetShareData(request);

            return Volume.Calculate(share.Days).ToList();
        }

        [Route("api/indicator/atr")]
        public List<Point<Decimal>> GetAtrIndicator([FromUri] InstrumentDataRequest request, [FromUri] Atr.Parameters parameters)
        {
            var share = _instrumentDataRepo.GetShareData(request);

            return new Atr().Calculate(share.Days, parameters, 0, pad: true).ToList();
        }

        [Route("api/indicator/macdSignalLine")]
        public List<MacdSignalLine.Point> GetMacdSignalLineIndicator([FromUri] InstrumentDataRequest request, [FromUri] MacdSignalLine.Parameters parameters)
        {
            var share = _instrumentDataRepo.GetShareData(request);

            return new MacdSignalLine().Calculate(share.Days, parameters).ToList();
        }

        [Route("api/indicator/macdh")]
        public List<Point<Decimal>> GetMacdhIndicator([FromUri] InstrumentDataRequest request, [FromUri] Macdh.Parameters parameters)
        {
            var share = _instrumentDataRepo.GetShareData(request);

            return new Macdh().Calculate(share.Days, parameters).ToList();
        }

        [Route("api/indicator/adx")]
        public List<Adx.Point> GetAdxIndicator([FromUri] InstrumentDataRequest request, [FromUri] Adx.Parameters parameters)
        {
            var share = _instrumentDataRepo.GetShareData(request);

            return new Adx().Calculate(share.Days, parameters).ToList();
        }

        [Route("api/indicator/percentr")]
        public List<Point<Decimal>> GetPercentRIndicator([FromUri] InstrumentDataRequest request, [FromUri] PercentR.Parameters parameters)
        {
            var share = _instrumentDataRepo.GetShareData(request);

            return new PercentR().Calculate(share.Days, parameters).ToList();
        }

        [Route("api/indicator/tradingband")]
        public List<TradingBand.Point> GetTradingBandIndicator([FromUri] InstrumentDataRequest request, [FromUri] TradingBand.Parameters parameters)
        {
            var share = _instrumentDataRepo.GetShareData(request);

            return new TradingBand().Calculate(share.Days, parameters).ToList();
        }
    }
}