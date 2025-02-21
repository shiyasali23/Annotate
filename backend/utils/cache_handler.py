from django.core.cache import cache
import logging

class CacheHandler:
    def __init__(self):
        self.cache_timeout = None  

    def get_from_cache(self, cache_key):
        try:
            return cache.get(cache_key)
        except Exception as e:
            logging.error(f"Error fetching from cache: {e}")
            return None

    def set_to_cache(self, cache_key, data):
        try:
            cache.set(cache_key, data, timeout=self.cache_timeout)
        except Exception as e:
            logging.error(f"Error setting to cache: {e}")

    def delete_from_cache(self, cache_key):
        try:
            cache.delete(cache_key)
        except Exception as e:
            logging.error(f"Error deleting from cache: {e}")

