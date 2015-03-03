using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Shares.Model.Test.Indicators
{
    public static class EnumerableAssert
    {
        public static void AreEqual<T>(IEnumerable<T> expected, IEnumerable<T> actual, IComparer<T> comparer, bool printAll = true)
        {
            var expectedEnum = expected.GetEnumerator();
            var actualEnum = actual.GetEnumerator();
            var m = new StringBuilder();
            var same = true;
            int maxLength = 0;

            var expectedHasNext = true;
            var actualHasNext = true;
            int i = 0;

            m.AppendLine();

            while (true)
            {
                expectedHasNext = expectedHasNext && expectedEnum.MoveNext();
                actualHasNext = actualHasNext && actualEnum.MoveNext();
                
                if (!expectedHasNext && !actualHasNext)
                    break;

                var itemSame = expectedHasNext && actualHasNext &&
                               comparer.Compare(expectedEnum.Current, actualEnum.Current) == 0;

                if (printAll || !itemSame)
                {
                    m.AppendFormat("{0:00} ", i);

                    var expectedItem = String.Empty;
                    if (expectedHasNext)
                        expectedItem = expectedEnum.Current.ToString();

                    maxLength = Math.Max(expectedItem.Length, maxLength);
                    m.Append(expectedItem.PadRight(maxLength + 1));

                    if (actualHasNext)
                        m.Append(actualEnum.Current);

                    same = same && itemSame;

                    if (!itemSame && printAll)
                        m.Append(" <--X");

                    m.AppendLine();
                }

                i++;
            }

            if (!same)
                Assert.Fail(m.ToString());
        }
    }
}