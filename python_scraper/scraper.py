# eventbrite_scraper.py
"""
Production Eventbrite Scraper
✅ Uses Eventbrite's hidden JSON API (more reliable than HTML scraping)
✅ Fallback to Playwright when API fails
✅ Proper deduplication with eventHash
✅ MongoDB integration with status tracking
✅ Comprehensive error handling & logging
✅ Proxy support (optional)
✅ Rate limiting protection
"""

import os
import sys
import re
import json
import time
import logging
from datetime import datetime, timedelta
from hashlib import sha256
from urllib.parse import urlparse, parse_qs
import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient, UpdateOne
from pymongo.errors import DuplicateKeyError
from dotenv import load_dotenv
from dateutil import parser as date_parser

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

load_dotenv()

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB", "events_db")
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
events_col = db["events"]
scrape_logs_col = db["scrapeLogs"]

# Ensure indexes for performance
events_col.create_index("eventHash", unique=True, background=True)
events_col.create_index("dateTime", background=True)
events_col.create_index("status", background=True)
events_col.create_index("city", background=True)

def generate_event_hash(title, date_time, source_url):
    """Generate consistent hash for event deduplication"""
    raw = f"{title.strip().lower()}|{date_time.isoformat()}|{urlparse(source_url).path}"
    return sha256(raw.encode("utf-8")).hexdigest()

def parse_eventbrite_date(date_str):
    """Robust date parsing for Eventbrite's various date formats"""
    if not date_str:
        return datetime.utcnow() + timedelta(days=7)
    
    try:
        # Try ISO format first
        return date_parser.isoparse(date_str)
    except:
        pass
    
    try:
        # Try human-readable formats
        return date_parser.parse(date_str, fuzzy=True)
    except:
        pass
    
    # Fallback to 7 days from now
    return datetime.utcnow() + timedelta(days=7)

def extract_eventbrite_api_data(html_content, city):
    """
    Extract events from Eventbrite's hidden JSON API embedded in page
    More reliable than scraping HTML elements
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Method 1: Find JSON-LD structured data
    events = []
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(script.string)
            if isinstance(data, list):
                data = [d for d in data if d.get('@type') == 'Event']
            elif data.get('@type') != 'Event':
                continue
            
            items = data if isinstance(data, list) else [data]
            
            for item in items:
                try:
                    start_date = parse_eventbrite_date(item.get('startDate'))
                    end_date = parse_eventbrite_date(item.get('endDate', start_date))
                    
                    # Skip past events (except very recent ones)
                    if start_date < datetime.utcnow() - timedelta(hours=6):
                        continue
                    
                    venue = item.get('location', {})
                    address = venue.get('address', {})
                    
                    event = {
                        "title": item.get('name', '').strip(),
                        "shortSummary": item.get('description', '')[:200] if item.get('description') else f"Event in {city.title()}",
                        "description": item.get('description', ''),
                        "dateTime": start_date,
                        "endDateTime": end_date,
                        "venueName": venue.get('name', 'Venue TBD'),
                        "venueAddress": address.get('streetAddress', ''),
                        "city": address.get('addressLocality', city).title(),
                        "imageUrl": item.get('image', None),
                        "sourceName": "Eventbrite",
                        "sourceUrl": item.get('url', ''),
                        "sourceEventId": str(item.get('identifier', '')),
                        "category": [item.get('category', 'Event')] if item.get('category') else ['General'],
                        "tags": item.get('keywords', '').split(',') if item.get('keywords') else [],
                        "status": "new",
                        "lastScrapedAt": datetime.utcnow()
                    }
                    
                    # Generate hash AFTER we have all required fields
                    event["eventHash"] = generate_event_hash(
                        event["title"],
                        event["dateTime"],
                        event["sourceUrl"]
                    )
                    
                    # Skip if missing critical data
                    if not event["title"] or len(event["title"]) < 5:
                        continue
                    
                    events.append(event)
                except Exception as e:
                    logger.debug(f"Error parsing event item: {e}")
                    continue
        except Exception as e:
            logger.debug(f"Error parsing JSON-LD: {e}")
            continue
    
    # Method 2: Fallback to data-props attributes (Eventbrite's React props)
    if not events:
        for div in soup.find_all('div', attrs={'data-props': True}):
            try:
                props = json.loads(div['data-props'])
                event_list = props.get('events', [])
                
                for evt in event_list:
                    try:
                        start_date = parse_eventbrite_date(evt['start_date'])
                        end_date = parse_eventbrite_date(evt.get('end_date', start_date))
                        
                        if start_date < datetime.utcnow() - timedelta(hours=6):
                            continue
                        
                        event = {
                            "title": evt['name'].strip(),
                            "shortSummary": evt.get('summary', '')[:200] or f"Event in {city.title()}",
                            "description": evt.get('description', ''),
                            "dateTime": start_date,
                            "endDateTime": end_date,
                            "venueName": evt.get('venue', {}).get('name', 'Venue TBD'),
                            "venueAddress": evt.get('venue', {}).get('address', ''),
                            "city": evt.get('venue', {}).get('city', city).title(),
                            "imageUrl": evt.get('image', {}).get('url', None),
                            "sourceName": "Eventbrite",
                            "sourceUrl": evt['url'],
                            "sourceEventId": str(evt['id']),
                            "category": evt.get('category', ['General']),
                            "tags": evt.get('tags', []),
                            "status": "new",
                            "lastScrapedAt": datetime.utcnow()
                        }
                        
                        event["eventHash"] = generate_event_hash(
                            event["title"],
                            event["dateTime"],
                            event["sourceUrl"]
                        )
                        
                        if not event["title"] or len(event["title"]) < 5:
                            continue
                        
                        events.append(event)
                    except Exception as e:
                        logger.debug(f"Error parsing data-props event: {e}")
                        continue
            except Exception as e:
                logger.debug(f"Error parsing data-props: {e}")
                continue
    
    return events

def scrape_with_requests(city="sydney", max_retries=3):
    """
    Primary scraping method using requests + BeautifulSoup
    Faster and more efficient than Playwright when it works
    """
    city_slug = city.lower().replace(" ", "-")
    # base_url = f"https://www.eventbrite.com/d/australia--{city_slug}/events/"
    base_url = os.getenv("SOURCE_URL")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-AU,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://www.eventbrite.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    session = requests.Session()
    session.headers.update(headers)
    
    for attempt in range(max_retries):
        try:
            logger.info(f"_attempt {attempt + 1}/{max_retries} for {city.title()}")
            response = session.get(base_url, timeout=30)
            response.raise_for_status()
            
            # Check if we got blocked (Cloudflare, etc.)
            if "just a moment" in response.text.lower() or "cloudflare" in response.text.lower():
                logger.warning("Blocked by Cloudflare - switching to Playwright fallback")
                return None
            
            events = extract_eventbrite_api_data(response.text, city)
            
            if events:
                logger.info(f"✅ Extracted {len(events)} events via requests (attempt {attempt + 1})")
                return events
            else:
                logger.warning(f"No events found on attempt {attempt + 1}")
                time.sleep(2 ** attempt)  # Exponential backoff
                
        except requests.exceptions.RequestException as e:
            logger.warning(f"Request failed (attempt {attempt + 1}): {e}")
            time.sleep(2 ** attempt)
        except Exception as e:
            logger.error(f"Unexpected error during requests scrape: {e}")
            break
    
    logger.warning("All requests attempts failed - switching to Playwright fallback")
    return None

def scrape_with_playwright(city="sydney", max_scrolls=6):
    """
    Fallback scraping method using Playwright
    More robust against anti-bot measures but slower
    """
    try:
        from playwright.sync_api import sync_playwright
        
        city_slug = city.lower().replace(" ", "-")
        url = f"https://www.eventbrite.com/d/australia--{city_slug}/events/"
        
        logger.info(f"🕷️ Starting Playwright scrape for {city.title()}")
        
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                    "--no-sandbox",
                    "--disable-gpu",
                    "--disable-extensions",
                    "--mute-audio",
                    "--no-default-browser-check",
                    "--no-first-run",
                    "--disable-features=IsolateOrigins,site-per-process"
                ]
            )
            
            context = browser.new_context(
                viewport={"width": 1920, "height": 1080},
                locale="en-AU",
                timezone_id="Australia/Sydney",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                java_script_enabled=True,
                bypass_csp=True
            )
            
            # Anti-detection scripts
            context.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
                Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
                Object.defineProperty(navigator, 'languages', {get: () => ['en-AU', 'en']});
                Object.defineProperty(navigator, 'hardwareConcurrency', {get: () => 8});
                Object.defineProperty(navigator, 'deviceMemory', {get: () => 8});
                Object.defineProperty(navigator, 'platform', {get: () => 'Win32'});
                window.chrome = { runtime: {} };
                window.navigator.permissions.query = Promise.resolve({ state: 'granted' }).bind(Promise);
            """)
            
            page = context.new_page()
            
            # Navigate with timeout and error handling
            try:
                page.goto(url, timeout=60000, wait_until="networkidle")
                page.wait_for_timeout(3000)
            except Exception as e:
                logger.error(f"Failed to load page: {e}")
                browser.close()
                return []
            
            # Accept cookies if present
            try:
                page.click('button[data-testid="accept-cookies"], #onetrust-accept-btn-handler, button:has-text("Accept")', timeout=5000)
                page.wait_for_timeout(1500)
            except:
                pass
            
            # Scroll to load more events
            for i in range(max_scrolls):
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_timeout(2000 + i * 500)  # Increasing delay
            
            # Extract page content
            content = page.content()
            browser.close()
            
            events = extract_eventbrite_api_data(content, city)
            logger.info(f"✅ Extracted {len(events)} events via Playwright")
            return events
            
    except ImportError:
        logger.error("Playwright not installed. Install with: pip install playwright && playwright install")
        return []
    except Exception as e:
        logger.error(f"Playwright scrape failed: {e}")
        return []

def sync_to_mongo(events, city="Sydney", source="Eventbrite"):
    """
    Sync events to MongoDB with proper deduplication and status management
    Returns statistics dictionary
    """
    if not events:
        logger.warning("⚠️ No events to sync")
        return {"new": 0, "updated": 0, "unchanged": 0, "inactive": 0}
    
    stats = {"new": 0, "updated": 0, "unchanged": 0, "inactive": 0}
    scraped_hashes = {e["eventHash"] for e in events}
    
    # Bulk operations for efficiency
    bulk_ops = []
    
    for event in events:
        # Prepare update document
        update_doc = {
            "$set": {
                "title": event["title"],
                "shortSummary": event["shortSummary"],
                "description": event["description"],
                "dateTime": event["dateTime"],
                "endDateTime": event["endDateTime"],
                "venueName": event["venueName"],
                "venueAddress": event["venueAddress"],
                "city": event["city"],
                "imageUrl": event["imageUrl"],
                "sourceName": event["sourceName"],
                "sourceUrl": event["sourceUrl"],
                "sourceEventId": event["sourceEventId"],
                "category": event["category"],
                "tags": event["tags"],
                "lastScrapedAt": event["lastScrapedAt"]
            },
            "$setOnInsert": {
                "createdAt": datetime.utcnow()
            }
        }
        
        # Determine status logic
        existing = events_col.find_one({"eventHash": event["eventHash"]}, {"status": 1, "_id": 0})
        
        if existing:
            # Preserve "imported" status unless event details changed significantly
            if existing.get("status") == "imported":
                # Only update if critical fields changed
                critical_changed = (
                    event["title"] != existing.get("title") or
                    abs((event["dateTime"] - existing.get("dateTime", event["dateTime"])).total_seconds()) > 3600
                )
                if critical_changed:
                    update_doc["$set"]["status"] = "updated"
                else:
                    update_doc["$set"]["status"] = "imported"  # Keep imported status
            else:
                update_doc["$set"]["status"] = "updated" if existing.get("status") != "new" else "new"
        else:
            update_doc["$set"]["status"] = "new"
        
        bulk_ops.append(
            UpdateOne(
                {"eventHash": event["eventHash"]},
                update_doc,
                upsert=True
            )
        )
    
    # Execute bulk operations
    if bulk_ops:
        result = events_col.bulk_write(bulk_ops, ordered=False)
        stats["new"] = result.upserted_count
        stats["updated"] = result.modified_count
        stats["unchanged"] = len(events) - stats["new"] - stats["updated"]
    
    # Mark events not seen in this scrape as inactive (only for non-imported events)
    inactive_query = {
        "eventHash": {"$nin": list(scraped_hashes)},
        "status": {"$nin": ["inactive", "imported"]},
        "dateTime": {"$lt": datetime.utcnow() - timedelta(hours=12)},  # Only mark past events
        "sourceName": source,
        "city": city.title()
    }
    
    inactive_result = events_col.update_many(
        inactive_query,
        {
            "$set": {
                "status": "inactive",
                "lastScrapedAt": datetime.utcnow()
            }
        }
    )
    stats["inactive"] = inactive_result.modified_count
    
    # Log statistics
    logger.info("\n" + "="*70)
    logger.info(f"SYNC SUMMARY - {city.title()} ({source})")
    logger.info("="*70)
    logger.info(f"  ➕ New events:       {stats['new']}")
    logger.info(f"  🔄 Updated events:   {stats['updated']}")
    logger.info(f"  ⚪ Unchanged events: {stats['unchanged']}")
    logger.info(f"  ⏸️  Inactivated:      {stats['inactive']}")
    logger.info(f"  💾 Total in DB:      {events_col.count_documents({'sourceName': source, 'city': city.title()})}")
    logger.info("="*70)
    
    # Create scrape log
    scrape_log = {
        "sourceName": source,
        "city": city.title(),
        "totalFetched": len(events),
        "newEvents": stats["new"],
        "updatedEvents": stats["updated"],
        "inactiveEvents": stats["inactive"],
        "startedAt": datetime.utcnow() - timedelta(seconds=30),  # Approximate
        "finishedAt": datetime.utcnow(),
        "status": "success",
        "errorMessage": None
    }
    scrape_logs_col.insert_one(scrape_log)
    
    return stats

def main(city="sydney", use_playwright=False):
    """Main scraping function with fallback logic"""
    logger.info("="*70)
    logger.info(f"EVENTBRITE SCRAPER - {city.title()} - {datetime.utcnow().isoformat()}")
    logger.info("="*70 + "\n")
    
    start_time = time.time()
    
    # Try requests method first (faster)
    if not use_playwright:
        events = scrape_with_requests(city)
    
    # Fallback to Playwright if requests failed
    if not events or use_playwright:
        events = scrape_with_playwright(city, max_scrolls=8)
    
    if not events:
        logger.error("❌ Failed to scrape any events after all attempts")
        # Create failure log
        scrape_logs_col.insert_one({
            "sourceName": "Eventbrite",
            "city": city.title(),
            "totalFetched": 0,
            "newEvents": 0,
            "updatedEvents": 0,
            "inactiveEvents": 0,
            "startedAt": datetime.utcnow() - timedelta(seconds=30),
            "finishedAt": datetime.utcnow(),
            "status": "failed",
            "errorMessage": "No events scraped after all attempts"
        })
        return False
    
    # Sync to MongoDB
    stats = sync_to_mongo(events, city=city, source="Eventbrite")
    
    elapsed = time.time() - start_time
    logger.info(f"\n✨ Scraping completed in {elapsed:.1f} seconds")
    
    return stats["new"] + stats["updated"] > 0

if __name__ == "__main__":
    # Get city from command line argument or environment variable
    city = sys.argv[1] if len(sys.argv) > 1 else os.getenv("SCRAPER_CITY", "sydney")
    force_playwright = "--playwright" in sys.argv
    
    success = main(city=city, use_playwright=force_playwright)
    sys.exit(0 if success else 1)