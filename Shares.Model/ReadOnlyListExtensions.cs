using System;
using System.Collections.Generic;
using System.Linq;

namespace Shares.Model
{
    public static class ReadOnlyListExtensions
    {
        public static IEnumerable<TOut> ZipEnds<TIn, TOut>(this IReadOnlyList<TIn> t1, IReadOnlyList<TIn> t2, Func<TIn, TIn, TOut> combine)
        {
            IEnumerable<TIn> t1Enumerable;
            IEnumerable<TIn> t2Enumerable;

            if (t1.Count > t2.Count)
            {
                var difference = t1.Count - t2.Count;
                t1Enumerable = t1.Skip(difference);
                t2Enumerable = t2;
            }
            else
            {
                var difference = t2.Count - t1.Count;
                t1Enumerable = t1;
                t2Enumerable = t2.Skip(difference);
                
            }
            return t1Enumerable.Zip(t2Enumerable, combine);
        }

        public static IEnumerable<T> Skip<T>(this IReadOnlyList<T> source, int count)
        {
            for (int i = count; i < source.Count; i++)
                yield return source[i];
        }
    }
}