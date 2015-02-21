using System;
using System.Collections;
using System.Collections.Generic;

namespace Shares.Model.Test.Indicators
{
    public class PointComparer : IComparer<Point<Decimal>>, IComparer
    {
        private readonly long _multiplier;

        public PointComparer(int decimalAccuracy)
        {
            _multiplier = (long)Math.Pow(10, decimalAccuracy);
        }

        public bool Equal(Point<decimal> x, Point<decimal> y)
        {
            if (!x.DateTime.Equals(y.DateTime)) return false;

            return (long)(x.Value * _multiplier) == (long)(y.Value * _multiplier);
        }

        public int Compare(object x, object y)
        {
            return Equal((Point<decimal>)x, (Point<decimal>)y) ? 0 : -1;
        }

        public int Compare(Point<decimal> x, Point<decimal> y)
        {
            return Equal(x, y) ? 0 : -1;
        }
    }

    public class PointComparer<T> : IComparer<T>, IComparer
    {
        private readonly Func<T, DateTime> _getDate;
        private readonly Func<T, decimal> _getValue;
        private readonly long _multiplier;

        public PointComparer(int decimalAccuracy, Func<T, DateTime> getDate, Func<T, decimal> getValue)
        {
            _getDate = getDate;
            _getValue = getValue;
            _multiplier = (long)Math.Pow(10, decimalAccuracy);
        }

        public bool Equal(T x, T y)
        {
            if (!_getDate(x).Equals(_getDate(y))) return false;

            return (long)(_getValue(x) * _multiplier) == (long)(_getValue(y) * _multiplier);
        }

        public int Compare(object x, object y)
        {
            return Equal((T)x, (T)y) ? 0 : -1;
        }

        public int Compare(T x, T y)
        {
            return Equal(x, y) ? 0 : -1;
        }
    }
}