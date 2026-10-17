import urllib.request
import re

url = 'https://sayfiddinovyusuf773-hash.github.io/NovaMarket/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        print(f"Status: {resp.getcode()}, HTML length: {len(html)}")
        
        scripts = re.findall(r'src=["\']([^"\']+)["\']', html)
        css = re.findall(r'href=["\']([^"\']+\.css[^"\']*)["\']', html)
        
        print("Scripts in live HTML:", scripts)
        print("CSS in live HTML:", css)
        
        for s in scripts:
            if s.startswith('./') or not s.startswith('http'):
                full_s = 'https://sayfiddinovyusuf773-hash.github.io/NovaMarket/' + s.lstrip('./')
                try:
                    s_res = urllib.request.urlopen(urllib.request.Request(full_s, headers={'User-Agent': 'Mozilla/5.0'}))
                    print(f"Checking script {full_s} -> Status {s_res.getcode()}")
                except Exception as ex:
                    print(f"Checking script {full_s} -> FAILED: {ex}")

        for c in css:
            if c.startswith('./') or not c.startswith('http'):
                full_c = 'https://sayfiddinovyusuf773-hash.github.io/NovaMarket/' + c.lstrip('./')
                try:
                    c_res = urllib.request.urlopen(urllib.request.Request(full_c, headers={'User-Agent': 'Mozilla/5.0'}))
                    print(f"Checking CSS {full_c} -> Status {c_res.getcode()}")
                except Exception as ex:
                    print(f"Checking CSS {full_c} -> FAILED: {ex}")
except Exception as e:
    print("Failed to fetch live page:", e)
