using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq.Expressions;

namespace Shares.Model
{
    [DebuggerDisplay("({DateTime}, {Value})")]
    public struct Point<T> : IEquatable<Point<T>>
    {
        public Point(DateTime dateTime, T value) : this()
        {
            DateTime = dateTime;
            Value = value;
        }

        public DateTime DateTime { get; private set; }
        public T Value { get; private set; }

        public bool Equals(Point<T> other)
        {
            return DateTime.Equals(other.DateTime) && EqualityComparer<T>.Default.Equals(Value, other.Value);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            return obj is Point<T> && Equals((Point<T>) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return (DateTime.GetHashCode()*397) ^ EqualityComparer<T>.Default.GetHashCode(Value);
            }
        }

        public static bool operator ==(Point<T> left, Point<T> right)
        {
            return left.Equals(right);
        }

        public static bool operator !=(Point<T> left, Point<T> right)
        {
            return !left.Equals(right);
        }
    }

    public static class Point
    {
        public static Point<T> With<T>(DateTime dateTime, T value)
        {
            return new Point<T>(dateTime, value);
        }
    }
}