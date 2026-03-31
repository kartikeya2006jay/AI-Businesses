from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import httpx
import re
import json

router = APIRouter(prefix="/inventory", tags=["inventory-images"])

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
}

def _clean_name(name: str) -> str:
    """Removes special chars and extra spaces."""
    # Remove things like "-dove" or "(new)"
    name = re.sub(r'[\-\(\)\+\&\*]', ' ', name)
    # Remove extra spaces
    return " ".join(name.split())

async def _try_ddg_instant(name: str, client: httpx.AsyncClient) -> str | None:
    """Try DuckDuckGo Instant Answer API."""
    try:
        r = await client.get(
            f"https://api.duckduckgo.com/?q={name}&format=json&pretty=0",
            headers=HEADERS, timeout=3.0
        )
        if r.status_code == 200:
            data = r.json()
            # Try getting the image from DDG directly
            img = data.get("Image", "")
            if img:
                if img.startswith("/"):
                    return f"https://duckduckgo.com{img}"
                return img
    except Exception:
        pass
    return None

async def _try_wikipedia(name: str, client: httpx.AsyncClient) -> str | None:
    """Try Wikipedia Search + Summary for better title matching."""
    try:
        # Search for the page first to get the best title
        search_r = await client.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "list": "search",
                "srsearch": name,
                "srlimit": "1",
                "format": "json",
            },
            headers=HEADERS, timeout=3.0
        )
        if search_r.status_code == 200:
            results = search_r.json().get("query", {}).get("search", [])
            if results:
                title = results[0]["title"]
                slug = title.strip().replace(" ", "_")
                # Now get the summary
                r = await client.get(
                    f"https://en.wikipedia.org/api/rest_v1/page/summary/{slug}",
                    headers=HEADERS, timeout=3.0, follow_redirects=True
                )
                if r.status_code == 200:
                    thumb = r.json().get("thumbnail", {}).get("source", "")
                    if thumb:
                        return re.sub(r'/\d+px-', '/200px-', thumb)
    except Exception:
        pass
    return None

async def _try_wikimedia_search(name: str, client: httpx.AsyncClient) -> str | None:
    """Search Wikimedia Commons for product images."""
    try:
        r = await client.get(
            "https://commons.wikimedia.org/w/api.php",
            params={
                "action": "query",
                "list": "search",
                "srsearch": f"{name} product",
                "srnamespace": "6",
                "srlimit": "2",
                "format": "json",
            },
            headers=HEADERS, timeout=3.0
        )
        if r.status_code == 200:
            results = r.json().get("query", {}).get("search", [])
            for result in results:
                title = result.get("title", "")
                if title.startswith("File:"):
                    img_r = await client.get(
                        "https://commons.wikimedia.org/w/api.php",
                        params={
                            "action": "query",
                            "titles": title,
                            "prop": "imageinfo",
                            "iiprop": "url",
                            "iiurlwidth": "200",
                            "format": "json",
                        },
                        headers=HEADERS, timeout=3.0
                    )
                    if img_r.status_code == 200:
                        pages = img_r.json().get("query", {}).get("pages", {})
                        for page in pages.values():
                            info = page.get("imageinfo", [{}])
                            url = info[0].get("thumburl") or info[0].get("url")
                            if url:
                                return url
    except Exception:
        pass
    return None

async def _try_fallbacks(name: str, client: httpx.AsyncClient) -> str | None:
    """Final fallback: OpenFoodFacts or Robohash-style product placeholder."""
    try:
        # Open Food Facts
        off_r = await client.get(
            f"https://world.openfoodfacts.org/api/v2/search?categories_tags={name}&fields=image_front_small_url&page_size=1",
            headers=HEADERS, timeout=3.0
        )
        if off_r.status_code == 200:
            products = off_r.json().get("products", [])
            if products and products[0].get("image_front_small_url"):
                return products[0]["image_front_small_url"]
    except Exception:
        pass
    
    # Generic product image from a more reliable (non-deprecated) source
    # We use a curated list of generic keywords for Unsplash images that *exist*
    generic_map = {
        "shampoo": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=200&q=80",
        "soap": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=200&q=80",
        "biscuit": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=200&q=80",
        "oreo": "https://images.unsplash.com/photo-1616140508197-0fa9975f84d6?auto=format&fit=crop&w=200&q=80",
        "cadbury": "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=200&q=80",
        "chocolate": "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=200&q=80",
        "headset": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80",
        "electronics": "https://images.unsplash.com/photo-1526733169359-99434191060c?auto=format&fit=crop&w=200&q=80",
        "snack": "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?auto=format&fit=crop&w=200&q=80",
        "masala": "https://images.unsplash.com/photo-1596040033229-a9821ebd05ec?auto=format&fit=crop&w=200&q=80",
        "colgate": "https://images.unsplash.com/photo-1559591937-e68fb3305e5d?auto=format&fit=crop&w=200&q=80",
        "toothpaste": "https://images.unsplash.com/photo-1559591937-e68fb3305e5d?auto=format&fit=crop&w=200&q=80",
        "generic": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80"
    }
    
    for key, url in generic_map.items():
        if key in name.lower():
            return url
            
    return generic_map["generic"]

@router.get("/product-image")
async def get_product_image(name: str = Query(..., description="Product name")):
    """
    Highly robust multi-source image seeker.
    """
    clean_name = _clean_name(name)
    async with httpx.AsyncClient() as client:
        # 1. DDG Instant Answer (Fastest for popular products)
        url = await _try_ddg_instant(clean_name, client)
        if url: return JSONResponse({"url": url, "source": "ddg", "found": True})

        # 2. Wikipedia (Search -> Title -> Summary)
        url = await _try_wikipedia(clean_name, client)
        if url: return JSONResponse({"url": url, "source": "wikipedia", "found": True})

        # 3. Wikimedia
        url = await _try_wikimedia_search(clean_name, client)
        if url: return JSONResponse({"url": url, "source": "wikimedia", "found": True})

        # 4. Fallbacks
        url = await _try_fallbacks(clean_name, client)
        return JSONResponse({"url": url, "source": "robust-fallback", "found": True})
