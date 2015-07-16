namespace Shares.Model.Experiments
{
    public static class IndexedValue
    {
        public static IndexedValue<T> New<T>(int index, T value)
        {
            return new IndexedValue<T>(index, value);
        }
    }

    public struct IndexedValue<T>
    {
        public IndexedValue(int index, T value)
        {
            Index = index;
            Value = value;
        }

        public int Index { get; private set; }
        public T Value { get; private set; }
    }
}