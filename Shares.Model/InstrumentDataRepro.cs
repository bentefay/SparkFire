using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Caching;
using Shares.Model.Parsers;

namespace Shares.Model
{
    public class InstrumentDataRepo
    {
        private static readonly string[] _eodFilePaths = { @"C:\Data\Dropbox\Git\ASX", @"D:\Mesh\Dropbox\Git\ASX" };
        private static readonly MemoryCache _memoryCache = MemoryCache.Default;

        public List<string> GetAllInstrumentCodes()
        {
            var eodFilePath = GetEodFilePath();

            var instrumentCodes = Directory.GetFiles(eodFilePath, "*.eod").Select(Path.GetFileNameWithoutExtension).ToList();

            return instrumentCodes;
        }

        public Share GetShareData(InstrumentDataRequest request)
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
