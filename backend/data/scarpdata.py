import requests
from bs4 import BeautifulSoup
import json
import time

def scrape_all_pages():
    base_url = "https://www.shl.com/solutions/products/product-catalog/"
    all_products = []
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    # Hum 1 se 35 tak loop chalayenge (saare pages cover karne ke liye)
    for page_num in range(1, 35):
        print(f"Scraping Page {page_num}...")
        
        # SHL pagination query parameter handle karna
        page_url = f"{base_url}?page={page_num}" 
        
        try:
            response = requests.get(page_url, headers=headers, timeout=15)
            if response.status_code != 200:
                print(f"Page {page_num} nahi mila. Stopping.")
                break
                
            soup = BeautifulSoup(response.content, 'html.parser')
            rows = soup.find_all('tr', attrs={"data-entity-id": True})
            
            if not rows:
                print(f"Page {page_num} par koi data nahi hai. Ending loop.")
                break
            
            for row in rows:
                title_td = row.find('td', class_='custom__table-heading__title')
                if title_td:
                    title = title_td.get_text(strip=True)
                    link_tag = title_td.find('a', href=True)
                    link = "https://www.shl.com" + link_tag['href'] if link_tag else ""
                    
                    all_products.append({
                        "id": row.get('data-entity-id'),
                        "name": title,
                        "url": link,
                        "page_source": page_num
                    })
            
            # Server par load na pade aur block na ho jayein
            time.sleep(1) 

        except Exception as e:
            print(f"Error on page {page_num}: {e}")
            break

    # Final data save karna
    with open('shl_catalog.json', 'w', encoding='utf-8') as f:
        json.dump(all_products, f, indent=4)
    
    print(f"Mubarak ho! Total {len(all_products)} products scrape ho gaye.")

if __name__ == "__main__":
    scrape_all_pages()