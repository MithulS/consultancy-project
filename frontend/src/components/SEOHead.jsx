import { useEffect } from 'react';

const SEOHead = ({ 
  title = 'HomeHardware', 
  description = 'Shop quality hardware, electrical supplies, plumbing, tools, and home improvement products.',
  image = '/og-image.jpg',
  url = '',
  type = 'website',
  product = null
}) => {
  useEffect(() => {
    // Update title
    document.title = `${title} | HomeHardware`;
    
    // Update meta tags
    const updateMetaTag = (selector, content) => {
      const tag = document.querySelector(selector);
      if (tag && content) tag.setAttribute('content', content);
    };

    updateMetaTag('meta[name="description"]', description);
    updateMetaTag('meta[property="og:title"]', title);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:image"]', image);
    updateMetaTag('meta[property="og:url"]', url || window.location.href);
    updateMetaTag('meta[property="og:type"]', type);
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', image);

    // Add structured data for products
    if (product) {
      const existingScript = document.getElementById('structured-data');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.id = 'structured-data';
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.imageUrl,
        "url": url || window.location.href,
        "brand": {
          "@type": "Brand",
          "name": product.brand || "HomeHardware"
        },
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "USD",
          "availability": product.stock > 0 
            ? "https://schema.org/InStock" 
            : "https://schema.org/OutOfStock",
          "url": url || window.location.href
        },
        ...(product.rating && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": product.reviewCount || 0
          }
        })
      });
      document.head.appendChild(script);
      
      return () => {
        const scriptToRemove = document.getElementById('structured-data');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [title, description, image, url, type, product]);

  return null;
};

export default SEOHead;
