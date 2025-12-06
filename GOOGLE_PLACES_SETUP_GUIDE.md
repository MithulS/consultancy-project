# Google Places Address Autocomplete Integration Guide

## Overview
Add intelligent address autocomplete to your Checkout page using Google Places API.

---

## Step 1: Get Google Places API Key

### Create a Google Cloud Project:
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable "Places API" and "Maps JavaScript API"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key (starts with `AIza...`)

### Restrict API Key (Recommended):
1. Click on your API key
2. Under "Application restrictions":
   - Select "HTTP referrers (websites)"
   - Add: `http://localhost:5174/*` (development)
   - Add: `https://yourdomain.com/*` (production)
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose: "Places API" and "Maps JavaScript API"
4. Save

---

## Step 2: Install Required Package

```bash
cd frontend
npm install use-places-autocomplete
```

**Alternative**: Use Google Places API directly without dependencies (see below)

---

## Step 3: Add Google Places Script

### Update `frontend/index.html`:

Add this script tag in the `<head>` section:

```html
<!-- Google Places API -->
<script 
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places" 
  async 
  defer
></script>
```

**Or** load it dynamically (recommended):

```html
<!-- No script tag needed, we'll load it in JavaScript -->
```

---

## Step 4: Create AddressAutocomplete Component

### Create `frontend/src/components/AddressAutocomplete.jsx`:

```jsx
import React, { useEffect, useRef, useState } from 'react';

const AddressAutocomplete = ({ value, onChange, placeholder, required }) => {
  const inputRef = useRef(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Places API
  useEffect(() => {
    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      return;
    }

    // Load Google Places API dynamically
    const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    
    if (!API_KEY) {
      console.warn('Google Places API key not found. Add VITE_GOOGLE_PLACES_API_KEY to .env');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('Failed to load Google Places API');
    
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    const autocompleteInstance = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['address'], // Restrict to addresses
        componentRestrictions: { country: ['us', 'in', 'gb', 'ca'] }, // Customize countries
        fields: ['address_components', 'formatted_address', 'geometry']
      }
    );

    // Listen for place selection
    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      
      if (place && place.formatted_address) {
        // Parse address components
        const addressComponents = parseAddressComponents(place.address_components);
        
        // Call onChange with formatted data
        onChange({
          fullAddress: place.formatted_address,
          ...addressComponents,
          latitude: place.geometry?.location?.lat(),
          longitude: place.geometry?.location?.lng()
        });
      }
    });

    setAutocomplete(autocompleteInstance);

    return () => {
      if (autocompleteInstance) {
        window.google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [isLoaded, onChange]);

  // Parse address components into structured data
  const parseAddressComponents = (components) => {
    const address = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    };

    if (!components) return address;

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        address.street = component.long_name + ' ';
      }
      if (types.includes('route')) {
        address.street += component.long_name;
      }
      if (types.includes('locality') || types.includes('postal_town')) {
        address.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        address.state = component.short_name;
      }
      if (types.includes('postal_code')) {
        address.zipCode = component.long_name;
      }
      if (types.includes('country')) {
        address.country = component.long_name;
      }
    });

    return address;
  };

  // Handle manual input
  const handleChange = (e) => {
    onChange({ fullAddress: e.target.value });
  };

  return (
    <div className="address-autocomplete">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder || "Start typing your address..."}
        required={required}
        aria-label="Address autocomplete"
        aria-describedby="address-hint"
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '16px',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          transition: 'all 0.2s',
          outline: 'none'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#667eea';
          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e5e7eb';
          e.target.style.boxShadow = 'none';
        }}
      />
      <small id="address-hint" className="hint" style={{ display: 'block', marginTop: '6px', color: '#6b7280' }}>
        {isLoaded ? '📍 Start typing to see address suggestions' : '⏳ Loading address autocomplete...'}
      </small>
    </div>
  );
};

export default AddressAutocomplete;
```

---

## Step 5: Update Checkout Component

### Update `frontend/src/components/Checkout.jsx`:

```jsx
import React, { useState } from 'react';
import AddressAutocomplete from './AddressAutocomplete';

export default function Checkout() {
  const [shippingAddress, setShippingAddress] = useState({
    fullAddress: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const handleAddressChange = (addressData) => {
    setShippingAddress(prev => ({
      ...prev,
      ...addressData
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Shipping Information */}
      <fieldset>
        <legend>Shipping Address</legend>
        
        {/* Address Autocomplete */}
        <div className="form-group">
          <label htmlFor="address">Street Address</label>
          <AddressAutocomplete
            value={shippingAddress.fullAddress}
            onChange={handleAddressChange}
            placeholder="Start typing your address..."
            required
          />
        </div>
        
        {/* Auto-populated fields (read-only or editable) */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="state">State</label>
            <input
              id="state"
              type="text"
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="zipCode">ZIP Code</label>
            <input
              id="zipCode"
              type="text"
              value={shippingAddress.zipCode}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              id="country"
              type="text"
              value={shippingAddress.country}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
              required
            />
          </div>
        </div>
      </fieldset>
      
      {/* Rest of checkout form... */}
    </form>
  );
}
```

---

## Step 6: Add Environment Variable

### Add to `frontend/.env`:

```env
# Google Places API Key
VITE_GOOGLE_PLACES_API_KEY=AIzaYourAPIKeyHere

# Other environment variables...
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Step 7: Test Autocomplete

1. Restart frontend: `npm run dev`
2. Go to checkout page
3. Click on address field
4. Start typing an address (e.g., "1600 Pennsylvania")
5. Select from dropdown suggestions
6. Verify fields auto-populate: city, state, zip, country

---

## Alternative: Simpler Implementation (No Dependencies)

If you don't want to use a library, here's a minimal implementation:

### Create `frontend/src/components/SimpleAddressAutocomplete.jsx`:

```jsx
import React, { useEffect, useRef } from 'react';

const SimpleAddressAutocomplete = ({ onChange, ...props }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    const loadGooglePlaces = () => {
      if (!window.google || !window.google.maps) {
        setTimeout(loadGooglePlaces, 100);
        return;
      }

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place && place.formatted_address) {
          onChange(place.formatted_address);
        }
      });
    };

    loadGooglePlaces();
  }, [onChange]);

  return <input ref={inputRef} type="text" {...props} />;
};

export default SimpleAddressAutocomplete;
```

### Usage:
```jsx
<SimpleAddressAutocomplete
  onChange={(address) => setShippingAddress(address)}
  placeholder="Enter your address"
  required
/>
```

---

## Troubleshooting

### Issue: "This page can't load Google Maps correctly"
**Solution**: Verify API key is correct and Places API is enabled

### Issue: Autocomplete not showing suggestions
**Solution**: 
- Check browser console for errors
- Verify API key has no restrictions that block localhost
- Ensure "Places API" is enabled, not just "Maps JavaScript API"

### Issue: CORS errors
**Solution**: Add HTTP referrer restriction with `http://localhost:5174/*`

### Issue: Billing error
**Solution**: Enable billing in Google Cloud Console (free tier includes $200 credit)

---

## Pricing

Google Places API pricing (as of 2024):
- **Autocomplete**: $2.83 per 1,000 requests (first $200/month free)
- **Place Details**: $17 per 1,000 requests
- **Free tier**: $200 credit per month (covers ~70,000 autocomplete requests)

For most small to medium e-commerce sites, you'll stay within the free tier.

---

## Production Checklist

- ✅ API key restricted to your domain
- ✅ Only necessary APIs enabled (Places, Maps JavaScript)
- ✅ Billing enabled in Google Cloud Console
- ✅ Monitor usage in Google Cloud Console
- ✅ Consider implementing rate limiting if high traffic

---

## Resources

- Google Places API: https://developers.google.com/maps/documentation/places/web-service
- Autocomplete Documentation: https://developers.google.com/maps/documentation/javascript/place-autocomplete
- Pricing: https://developers.google.com/maps/billing-and-pricing/pricing

---

## Quick Start

```bash
# 1. Get API key from Google Cloud Console
# 2. Add to .env
echo "VITE_GOOGLE_PLACES_API_KEY=AIzaYourKeyHere" >> frontend/.env

# 3. Install component (optional)
cd frontend
npm install use-places-autocomplete

# 4. Restart frontend
npm run dev

# 5. Test checkout page
```

Done! Your address autocomplete is now ready. 🎉
