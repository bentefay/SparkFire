using System;
using System.Runtime.Caching;
using Newtonsoft.Json;

namespace Shares.Model
{
    public static class MemoryCacheExtensions
    {
        public static T GetOrAdd<T>(this MemoryCache cache, object key, Func<T> valueFactory,
            Action<bool> cacheHit = null)
        {
            return GetOrAdd(cache, key, new CacheItemPolicy(), valueFactory, cacheHit);
        }

        public static T GetOrAdd<T>(this MemoryCache cache, object key, CacheItemPolicy policy, Func<T> valueFactory, 
            Action<bool> cacheHit = null)
        {
            var cacheKey = CacheKey.Get(key);
            var lazy = new Lazy<T>(valueFactory, isThreadSafe: true);

            var cachedLazy = (Lazy<T>)cache.AddOrGetExisting(cacheKey, lazy, policy);

            if (cacheHit != null)
                cacheHit(cachedLazy == null);

            return (cachedLazy ?? lazy).Value;
        }
    }

    public static class CacheKey
    {
        public static string Get(object key)
        {
            var cacheable = key as ICacheable;
            if (cacheable != null)
                key = cacheable.ToCacheKey();

            var stringKey = key as string ?? JsonConvert.SerializeObject(key);

            return stringKey;
        }
    }

    public interface ICacheable
    {
        object ToCacheKey();
    }
}