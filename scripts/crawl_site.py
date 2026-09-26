#!/usr/bin/env python3
"""
Neural ChatBot - AI Web Knowledge Crawler & Memory Ingestion Agent
Fetches full website content using Jina Reader AI & Direct Crawling,
extracts structural intelligence, generates bilingual keywords & Q&A pairs,
and stores knowledge directly into data/memory.json.
"""

import sys
import os
import re
import json
import urllib.request
import urllib.error
import urllib.parse
import html
import subprocess
from datetime import datetime

# Fix Windows console UTF-8 output encoding
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEMORY_JSON = os.path.join(ROOT_DIR, "data", "memory.json")
BUILD_SCRIPT = os.path.join(ROOT_DIR, "scripts", "build.js")

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def clean_text(raw_text):
    if not raw_text:
        return ""
    # Remove excessive blank lines
    text = re.sub(r'\r\n|\r', '\n', raw_text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def fetch_via_jina(url):
    """Fetches clean LLM-ready markdown via Jina Reader AI."""
    jina_url = f"https://r.jina.ai/{url}"
    req = urllib.request.Request(
        jina_url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/markdown, text/plain, */*",
            "X-With-Generated-Alt": "true"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            content = response.read().decode('utf-8', errors='ignore')
            return content
    except Exception as e:
        print(f"[Crawler] Jina Reader fallback due to: {e}")
        return None

def fetch_via_direct_http(url):
    """Fallback: Direct HTTP fetch with HTML tag stripping."""
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            raw_html = response.read().decode('utf-8', errors='ignore')
            
            # Remove scripts, styles, navigations
            raw_html = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', ' ', raw_html, flags=re.I)
            raw_html = re.sub(r'<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>', ' ', raw_html, flags=re.I)
            raw_html = re.sub(r'<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>', ' ', raw_html, flags=re.I)
            raw_html = re.sub(r'<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>', ' ', raw_html, flags=re.I)
            
            # Extract title
            title_m = re.search(r'<title>(.*?)</title>', raw_html, re.I | re.S)
            title = title_m.group(1).strip() if title_m else ""
            
            # Strip tags
            text = re.sub(r'<[^>]+>', ' ', raw_html)
            text = html.unescape(text)
            text = re.sub(r'[ \t]+', ' ', text)
            text = clean_text(text)
            
            if title:
                text = f"# {title}\n\n" + text
            return text
    except Exception as e:
        print(f"[Crawler] Direct HTTP fetch failed: {e}")
        return None

def extract_key_sections(markdown_text, max_chars=3500):
    """Summarizes and extracts high-value headings, bullet points, and key paragraphs."""
    if not markdown_text:
        return ""
    
    # Strip markdown images and excessive links
    text = re.sub(r'!\[.*?\]\(.*?\)', '', markdown_text)
    
    lines = text.split('\n')
    extracted = []
    current_length = 0
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        # Skip repetitive navigation headers
        if re.match(r'^(cookie|login|sign in|privacy policy|terms of service|menu|navigation)', stripped, re.I):
            continue
            
        extracted.append(stripped)
        current_length += len(stripped)
        if current_length >= max_chars:
            break
            
    return '\n\n'.join(extracted)

def generate_keywords(title, url, content):
    """Generates comprehensive bilingual and phonetic keywords from the webpage."""
    parsed = urllib.parse.urlparse(url)
    domain_clean = parsed.hostname.replace('www.', '').split('.')[0] if parsed.hostname else 'website'
    
    # Extract clean title tokens
    title_clean = re.sub(r'[^\w\s]', ' ', title).lower()
    title_words = [w for w in title_clean.split() if len(w) > 2 and w not in ['the', 'and', 'for', 'with', 'from', 'about']]
    
    keywords_en = [
        title.lower(),
        f"what is {title.lower()}",
        f"about {title.lower()}",
        f"tell me about {title.lower()}",
        domain_clean,
        f"{domain_clean} overview",
        f"{domain_clean} website details",
        f"info on {title.lower()}"
    ]
    
    for w in title_words[:4]:
        keywords_en.append(w)
        keywords_en.append(f"what is {w}")
    
    keywords_bn = [
        f"{title} কি",
        f"{title} সম্পর্কে বলো",
        f"{title} সম্পর্কে বিস্তারিত",
        f"{title} কীভাবে কাজ করে",
        f"{domain_clean} ওয়েবসাইট কি",
        f"{domain_clean} সম্পর্কে তথ্য",
        f"{title.lower()} somporke bolo",
        f"{title.lower()} ki",
        f"{title.lower()} somporkey kiso idea daow",
        f"{domain_clean} somporke janaw"
    ]
    
    # Deduplicate while preserving order
    def uniq(lst):
        seen = set()
        res = []
        for x in lst:
            x_s = x.strip().lower()
            if x_s and x_s not in seen:
                seen.add(x_s)
                res.append(x.strip())
        return res
        
    return uniq(keywords_en), uniq(keywords_bn)

def build_knowledge_entry(url, custom_title=None, category="web_ai"):
    print(f"\n🌐 [Crawler] Starting extraction for: {url}")
    
    # 1. Fetch
    content = fetch_via_jina(url)
    if not content or len(content.strip()) < 80:
        print("[Crawler] Jina returned insufficient data, falling back to direct HTTP...")
        content = fetch_via_direct_http(url)
        
    if not content or len(content.strip()) < 50:
        print("❌ [Crawler Error] Could not extract readable content from URL.")
        return None

    # 2. Parse Title
    title = custom_title
    if not title:
        # Check first line H1
        first_line = content.split('\n')[0].strip()
        if first_line.startswith('#'):
            title = re.sub(r'^#+\s*', '', first_line).strip()
        else:
            parsed = urllib.parse.urlparse(url)
            title = parsed.hostname.replace('www.', '') if parsed.hostname else "Web Resource"
            
    # Clean Title
    title = title.split(' - ')[0].split(' | ')[0].strip()
    
    # 3. Process Content
    summary_text = extract_key_sections(content, max_chars=3200)
    
    # 4. Generate Keywords
    kw_en, kw_bn = generate_keywords(title, url, summary_text)
    
    # 5. Format Responses
    parsed_domain = urllib.parse.urlparse(url).hostname or "Source Link"
    
    response_en = f"🌐 <strong>{title}</strong> (Extracted from <a href='{url}' target='_blank' style='color:#00f2fe;'>{parsed_domain}</a>):<br><br>"
    
    # Convert markdown bullet points to HTML
    body_html = summary_text.replace('\n\n', '<br><br>').replace('\n', '<br>')
    body_html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', body_html)
    body_html = re.sub(r'#+\s*(.*?)(?:<br>|$)', r'<strong>\1</strong><br>', body_html)
    
    response_en += body_html
    
    response_bn = f"🌐 <strong>{title}</strong> সম্পর্কিত তথ্য (<a href='{url}' target='_blank' style='color:#00f2fe;'>{parsed_domain}</a> থেকে সংগৃহীত):<br><br>"
    response_bn += body_html
    
    # 6. Build Object
    clean_id = "mem_web_" + re.sub(r'[^a-zA-Z0-9]', '_', parsed_domain).strip('_') + "_" + datetime.now().strftime("%Y%m%d%H%M")
    
    entry = {
        "id": clean_id,
        "category": category,
        "title": f"{title} (Web Ingested: {parsed_domain})",
        "url": url,
        "ingested_at": datetime.now().isoformat(),
        "keywords_en": kw_en,
        "keywords_bn": kw_bn,
        "responses_en": [response_en],
        "responses_bn": [response_bn]
    }
    
    return entry

def save_to_memory_json(entry):
    if not os.path.exists(MEMORY_JSON):
        os.makedirs(os.path.dirname(MEMORY_JSON), exist_ok=True)
        items = []
    else:
        try:
            with open(MEMORY_JSON, 'r', encoding='utf-8') as f:
                items = json.load(f)
        except Exception:
            items = []
            
    # Check if entry with same URL exists, replace it
    existing_idx = None
    for i, it in enumerate(items):
        if it.get("url") == entry.get("url") or it.get("id") == entry.get("id"):
            existing_idx = i
            break
            
    if existing_idx is not None:
        items[existing_idx] = entry
        print(f"🔄 [Crawler] Updated existing memory entry for: {entry.get('title')}")
    else:
        items.append(entry)
        print(f"✅ [Crawler] Added new memory entry: {entry.get('title')}")
        
    with open(MEMORY_JSON, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
        
    print(f"💾 [Crawler] Memory saved ({len(items)} total knowledge items in {os.path.basename(MEMORY_JSON)}).")

def trigger_build():
    if os.path.exists(BUILD_SCRIPT):
        print("🔨 [Crawler] Compiling index.html with node scripts/build.js...")
        try:
            subprocess.run(["node", BUILD_SCRIPT], check=True, cwd=ROOT_DIR)
            print("✨ [Crawler] Build complete!")
        except Exception as e:
            print(f"⚠️ [Crawler] Build failed: {e}")

def main():
    if len(sys.argv) < 2:
        print("=" * 60)
        print("🤖 Neural ChatBot - AI Web Knowledge Crawler")
        print("=" * 60)
        print("Usage:")
        print("  python scripts/crawl_site.py <WEBSITE_URL> [CUSTOM_TITLE]")
        print("\nExample:")
        print("  python scripts/crawl_site.py https://en.wikipedia.org/wiki/Artificial_intelligence 'Artificial Intelligence'")
        print("  python scripts/crawl_site.py https://pytorch.org/tutorials 'PyTorch Tutorials'")
        print("=" * 60)
        sys.exit(1)
        
    target_url = sys.argv[1].strip()
    if not target_url.startswith("http://") and not target_url.startswith("https://"):
        target_url = "https://" + target_url
        
    custom_title = sys.argv[2].strip() if len(sys.argv) > 2 else None
    
    entry = build_knowledge_entry(target_url, custom_title)
    if entry:
        save_to_memory_json(entry)
        trigger_build()
        print("\n🎉 Success! Neural ChatBot is now equipped with knowledge from this website.")
    else:
        print("\n❌ Extraction failed. Please verify the URL.")

if __name__ == "__main__":
    main()
