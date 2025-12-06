import React, { useEffect, useRef, useState } from 'react';

/**
 * AddressAutocomplete Component
 * 
 * Provides Google Places-powered address autocomplete functionality.
 * Falls back to regular text input if API is not configured.
 * 
 * Props:
 * - value: Current address value
 * - onChange: Callback with address data { fullAddress, street, city, state, zipCode, country }
 * - placeholder: Input placeholder text
 * - required: Whether field is required
 */
const AddressAutocomplete = ({ value, onChange, placeholder, required }) => {
  const inputRef = useRef(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Load Google Places API
  useEffect(() => {
    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      return;
    }

    // Get API key from environment
    const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    
    if (!API_KEY) {
      console.info('💡 Google Places API key not found. Add VITE_GOOGLE_PLACES_API_KEY to .env for address autocomplete.');
      setLoadError(true);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      return;
    }

    // Load Google Places API dynamically
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    
    // Global callback for script load
    window.initGooglePlaces = () => {
      setIsLoaded(true);
      delete window.initGooglePlaces;
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Places API. Check your API key and network connection.');
      setLoadError(true);
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (window.initGooglePlaces) {
        delete window.initGooglePlaces;
      }
    };
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current || loadError) return;

    try {
      const autocompleteInstance = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'], // Restrict to full addresses
          componentRestrictions: { country: ['us', 'in', 'gb', 'ca', 'au'] }, // Customize as needed
          fields: ['address_components', 'formatted_address', 'geometry']
        }
      );

      // Listen for place selection
      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        
        if (!place || !place.formatted_address) {
          console.warn('No valid address selected');
          return;
        }
        
        // Parse address components
        const addressComponents = parseAddressComponents(place.address_components);
        
        // Call onChange with structured data
        onChange({
          fullAddress: place.formatted_address,
          ...addressComponents,
          latitude: place.geometry?.location?.lat(),
          longitude: place.geometry?.location?.lng()
        });
      });

      setAutocomplete(autocompleteInstance);
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
      setLoadError(true);
    }

    return () => {
      if (autocompleteInstance) {
        window.google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [isLoaded, onChange, loadError]);

  /**
   * Parse Google Places address components into structured data
   */
  const parseAddressComponents = (components) => {
    const address = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    };

    if (!components || !Array.isArray(components)) return address;

    components.forEach(component => {
      const types = component.types;
      
      // Street number
      if (types.includes('street_number')) {
        address.street = component.long_name + ' ';
      }
      
      // Street name
      if (types.includes('route')) {
        address.street += component.long_name;
      }
      
      // City
      if (types.includes('locality') || types.includes('postal_town')) {
        address.city = component.long_name;
      }
      
      // State/Province
      if (types.includes('administrative_area_level_1')) {
        address.state = component.short_name; // Use short name for state codes (CA, TX, etc.)
      }
      
      // ZIP/Postal Code
      if (types.includes('postal_code')) {
        address.zipCode = component.long_name;
      }
      
      // Country
      if (types.includes('country')) {
        address.country = component.long_name;
      }
    });

    return address;
  };

  /**
   * Handle manual input (when user types without selecting from dropdown)
   */
  const handleChange = (e) => {
    const inputValue = e.target.value;
    onChange({ fullAddress: inputValue });
  };

  /**
   * Get status message
   */
  const getStatusMessage = () => {
    if (loadError) {
      return '⚠️ Address autocomplete unavailable. Please enter address manually.';
    }
    if (!isLoaded) {
      return '⏳ Loading address autocomplete...';
    }
    return '📍 Start typing to see address suggestions';
  };

  return (
    <div className="address-autocomplete" style={{ width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder || "Start typing your address..."}
        required={required}
        aria-label="Address with autocomplete"
        aria-describedby="address-autocomplete-hint"
        autoComplete="off"
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '16px',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          transition: 'all 0.2s',
          outline: 'none',
          fontFamily: 'inherit'
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
      <small 
        id="address-autocomplete-hint" 
        className="hint" 
        style={{ 
          display: 'block', 
          marginTop: '6px', 
          color: loadError ? '#dc2626' : '#6b7280',
          fontSize: '0.875rem'
        }}
      >
        {getStatusMessage()}
      </small>
    </div>
  );
};

export default AddressAutocomplete;
