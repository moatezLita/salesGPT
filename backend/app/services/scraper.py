import httpx
from bs4 import BeautifulSoup
from typing import Dict, List
from fastapi import HTTPException
from urllib.parse import urljoin, urlparse
import logging

class WebScraperError(Exception):
    """Custom exception for web scraping errors"""
    pass

class WebScraper:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def scrape_website(self, url: str) -> Dict:
        try:
            # Validate URL format
            if not self._is_valid_url(url):
                raise WebScraperError(f"Invalid URL format: {url}")

            # Configure timeout and headers
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }

            async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()  # Raise exception for bad status codes
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

        except httpx.HTTPStatusError as e:
            self.logger.error(f"HTTP error occurred: {str(e)}")
            raise WebScraperError(f"Failed to access website: HTTP {e.response.status_code}")
        except httpx.RequestError as e:
            self.logger.error(f"Request error occurred: {str(e)}")
            raise WebScraperError(f"Failed to connect to website: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error during scraping: {str(e)}")
            raise WebScraperError(f"Failed to scrape website: {str(e)}")

    def _is_valid_url(self, url: str) -> bool:
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except Exception:
            return False

    def _clean_text(self, text: str) -> str:
        return ' '.join(text.split()) if text else ''

    def _get_meta_description(self, soup) -> str:
        try:
            # Try standard meta description
            meta = soup.find('meta', {'name': ['description', 'Description']})
            if not meta:
                # Try OpenGraph and Twitter meta descriptions
                meta = soup.find('meta', {'property': ['og:description', 'twitter:description']})
            return self._clean_text(meta['content']) if meta and 'content' in meta.attrs else ''
        except Exception as e:
            self.logger.warning(f"Error extracting meta description: {str(e)}")
            return ''

    def _extract_main_content(self, soup) -> str:
        try:
            # Remove unwanted elements
            for element in soup(['script', 'style', 'nav', 'footer']):
                element.decompose()
            
            content_elements = []
            main_content = soup.find_all(['main', 'article', 'section', 'div'], 
                                       class_=lambda x: x and any(word in str(x).lower() 
                                       for word in ['content', 'main', 'article']))
            
            for element in main_content:
                content_elements.append(self._clean_text(element.get_text(separator=' ')))
            
            return ' '.join(content_elements)
        except Exception as e:
            self.logger.warning(f"Error extracting main content: {str(e)}")
            return ''

    def _find_social_links(self, soup, base_url: str) -> List[str]:
        try:
            social_patterns = ['facebook.com', 'linkedin.com', 'twitter.com', 'instagram.com']
            social_links = set()
            
            for link in soup.find_all('a', href=True):
                href = link['href']
                if not href.startswith(('http://', 'https://')):
                    href = urljoin(base_url, href)
                if any(pattern in href.lower() for pattern in social_patterns):
                    social_links.add(href)
            
            return list(social_links)
        except Exception as e:
            self.logger.warning(f"Error extracting social links: {str(e)}")
            return []

    def _extract_contact_info(self, soup) -> Dict:
        try:
            contact_info = {
                'email': None,
                'phone': None,
                'address': None
            }
            
            email_elements = soup.find_all(string=lambda text: '@' in str(text) if text else False)
            if email_elements:
                contact_info['email'] = self._clean_text(email_elements[0])
            
            return contact_info
        except Exception as e:
            self.logger.warning(f"Error extracting contact info: {str(e)}")
            return {'email': None, 'phone': None, 'address': None}