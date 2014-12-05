using System;
using System.IO;
using System.Linq;
using System.Web.Http;
using Shares.Model;
using Shares.Model.Parsers;

namespace Shares.Web.Controllers
{
    public class SharesController : ApiController
    {
        public ShareDto Get(string path)
        {
            var fullPath = Path.Combine(@"D:\Mesh\Dropbox\Git\SparkFire\SharesUI", path);

            var parser = new EodParser();
            var share = parser.ParseFile(fullPath);

            return new ShareDto(share);
        }

        public class ShareDto
        {
            public ShareDto(Share s)
            {
                Description = s.Description;
                Date = s.Days.Select(d => d.Date).ToArray();
                Open = s.Days.Select(d => d.Open).ToArray();
                High = s.Days.Select(d => d.High).ToArray();
                Low = s.Days.Select(d => d.Low).ToArray();
                Close = s.Days.Select(d => d.Close).ToArray();
                Volume = s.Days.Select(d => d.Volume).ToArray();
                OpenInt = s.Days.Select(d => d.OpenInt).ToArray();
            }

            public string Description { get; set; }

            public DateTime[] Date { get; set; }
            public Single[] Open { get; set; }
            public Single[] High { get; set; }
            public Single[] Low { get; set; }
            public Single[] Close { get; set; }
            public Int32[] Volume { get; set; }
            public UInt16[] OpenInt { get; set; }
        }
    }
}