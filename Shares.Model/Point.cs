using System;

namespace Shares.Model
{
    public struct Point<T>
    {
        public Point(DateTime dateTime, T value) : this()
        {
            DateTime = dateTime;
            Value = value;
        }

        public DateTime DateTime { get; private set; }
        public T Value { get; private set; }
    }

    public static class Point
    {
        public static Point<T> With<T>(DateTime dateTime, T value)
        {
            return new Point<T>(dateTime, value);
        }
    }
}