using System;
using System.Collections;

namespace Shares.Model.Test.Indicators
{
    public class PointComparer : IComparer
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
    }
}