using System;
using System.Collections.Generic;
using System.Linq;
using C5;

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

    public static class EnumerableExtensions
    {
        public static T Last<T>(this CircularQueue<T> source)
        {
            return source[source.Count - 1];
        }

        public static IEnumerable<CircularQueue<TSource>> FullWindow<TSource>(this IEnumerable<TSource> source, int size)
        {
            return Window(source, size, onlyFullWindows: true);
        }

        public static IEnumerable<CircularQueue<TSource>> Window<TSource>(this IEnumerable<TSource> source, int size, bool onlyFullWindows = false)
        {
            if (source == null) throw new ArgumentNullException("source");
            if (size <= 0) throw new ArgumentOutOfRangeException("size");

            return WindowedImpl(source, size);
        }

        private static IEnumerable<CircularQueue<TSource>> WindowedImpl<TSource>(this IEnumerable<TSource> source, int size, bool onlyFullWindows = false)
        {
            using (var iter = source.GetEnumerator())
            {
                var countLeft = size;
                var window = new CircularQueue<TSource>();

                while (countLeft-- > 0 && iter.MoveNext())
                {
                    window.Enqueue(iter.Current);
                }

                if (window.Count == size || !onlyFullWindows)
                    yield return window;

                while (iter.MoveNext())
                {
                    window.Dequeue();
                    window.Enqueue(iter.Current);
                    yield return window;
                }
            }
        }
    }
}