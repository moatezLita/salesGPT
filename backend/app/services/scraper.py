# File: backend/app/services/scraper.py
import httpx
from bs4 import BeautifulSoup
from typing import Dict, List
from fastapi import HTTPException
from urllib.parse import urljoin

class WebScraper:
    async def scrape_website(self, url: str) -> Dict:
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
                response = await client.get(url)
                final_url = str(response.url)
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                extracted_data = {
                    'title': self._clean_text(soup.title.string) if soup.title else '',
                    'meta_description': self._get_meta_description(soup),
                    'main_content': self._extract_main_content(soup),
                    'social_links': self._find_social_links(soup, final_url),
                    'contact_info': self._extract_contact_info(soup),
                    'final_url': final_url
                }
                
                return extracted_data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to scrape website: {str(e)}")

    def _clean_text(self, text: str) -> str:
        return ' '.join(text.split()) if text else ''

    def _get_meta_description(self, soup) -> str:
        meta = soup.find('meta', {'name': ['description', 'Description']})
        if not meta:
            meta = soup.find('meta', {'property': ['og:description', 'twitter:description']})
        return self._clean_text(meta['content']) if meta and 'content' in meta.attrs else ''

    def _extract_main_content(self, soup) -> str:
        for element in soup(['script', 'style', 'nav', 'footer']):
            element.decompose()
        
        content_elements = []
        main_content = soup.find_all(['main', 'article', 'section', 'div'], 
                                   class_=lambda x: x and any(word in str(x).lower() 
                                   for word in ['content', 'main', 'article']))
        
        for element in main_content:
            content_elements.append(self._clean_text(element.get_text(separator=' ')))
        
        return ' '.join(content_elements)

    def _find_social_links(self, soup, base_url: str) -> List[str]:
        social_patterns = ['facebook.com', 'linkedin.com', 'twitter.com', 'instagram.com']
        social_links = set()
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            if not href.startswith(('http://', 'https://')):
                href = urljoin(base_url, href)
            if any(pattern in href.lower() for pattern in social_patterns):
                social_links.add(href)
        
        return list(social_links)

    def _extract_contact_info(self, soup) -> Dict:
        contact_info = {
            'email': None,
            'phone': None,
            'address': None
        }
        
        email_elements = soup.find_all(string=lambda text: '@' in str(text) if text else False)
        if email_elements:
            contact_info['email'] = self._clean_text(email_elements[0])
        
        return contact_info
