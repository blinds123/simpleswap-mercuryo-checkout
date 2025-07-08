/**
 * Production Geo-location and Regional Access Control
 * Enhanced regional validation with caching and fallback methods
 */
class GeoRedirector {
    constructor(config = {}) {
        this.config = config;
        this.supportedCountries = ['US', 'CA', 'AU'];
        this.countryRestrictions = {
            'US': {
                excludedStates: ['HI', 'LA', 'NY'], // Hawaii, Louisiana, New York
                excludedStateNames: ['Hawaii', 'Louisiana', 'New York']
            },
            'CA': {
                excludedStates: [],
                excludedStateNames: []
            },
            'AU': {
                excludedStates: [],
                excludedStateNames: []
            }
        };
        
        this.userLocation = null;
        this.locationCache = new Map();
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.cacheTimeout = 300000; // 5 minutes
        
        this.initializeTimezoneMapping();
    }
    
    /**
     * Initialize comprehensive timezone to country mapping
     */
    initializeTimezoneMapping() {
        this.timezoneMap = {
            // United States
            'America/New_York': { country: 'US', region: 'Eastern' },
            'America/Chicago': { country: 'US', region: 'Central' },
            'America/Denver': { country: 'US', region: 'Mountain' },
            'America/Los_Angeles': { country: 'US', region: 'Pacific' },
            'America/Anchorage': { country: 'US', region: 'Alaska' },
            'Pacific/Honolulu': { country: 'US', region: 'Hawaii' },
            
            // Canada
            'America/Toronto': { country: 'CA', region: 'Ontario' },
            'America/Vancouver': { country: 'CA', region: 'British Columbia' },
            'America/Edmonton': { country: 'CA', region: 'Alberta' },
            'America/Winnipeg': { country: 'CA', region: 'Manitoba' },
            'America/Halifax': { country: 'CA', region: 'Nova Scotia' },
            'America/St_Johns': { country: 'CA', region: 'Newfoundland' },
            
            // Australia
            'Australia/Sydney': { country: 'AU', region: 'New South Wales' },
            'Australia/Melbourne': { country: 'AU', region: 'Victoria' },
            'Australia/Brisbane': { country: 'AU', region: 'Queensland' },
            'Australia/Perth': { country: 'AU', region: 'Western Australia' },
            'Australia/Adelaide': { country: 'AU', region: 'South Australia' },
            'Australia/Darwin': { country: 'AU', region: 'Northern Territory' },
            'Australia/Hobart': { country: 'AU', region: 'Tasmania' }
        };
    }
    
    /**
     * Enhanced location detection with multiple fallbacks and caching
     */
    async detectUserLocation(useCache = true) {
        try {
            const cacheKey = 'user_location_primary';
            
            // Check cache first
            if (useCache && this.locationCache.has(cacheKey)) {
                const cached = this.locationCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    this.userLocation = cached.data;
                    console.log('Using cached location:', cached.data);
                    return cached.data;
                }
            }
            
            let location = null;
            let lastError = null;
            
            // Method 1: IP-based geolocation (primary)
            for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
                try {
                    location = await this.getLocationByIP();
                    if (location) break;
                } catch (error) {
                    lastError = error;
                    console.warn(`IP geolocation attempt ${attempt} failed:`, error);
                    if (attempt < this.maxRetries) {
                        await this.delay(this.retryDelay * attempt);
                    }
                }
            }
            
            // Method 2: Browser geolocation (if IP failed)
            if (!location) {
                try {
                    location = await this.getLocationByBrowser();
                } catch (error) {
                    console.warn('Browser geolocation failed:', error);
                }
            }
            
            // Method 3: Timezone-based detection (fallback)
            if (!location) {
                location = this.getLocationByTimezone();
                console.log('Using timezone-based location detection');
            }
            
            // Method 4: Language-based detection (last resort)
            if (!location) {
                location = this.getLocationByLanguage();
                console.log('Using language-based location detection');
            }
            
            if (location) {
                // Cache successful result
                this.locationCache.set(cacheKey, {
                    data: location,
                    timestamp: Date.now()
                });
                
                this.userLocation = location;
                console.log('Location detected:', location);
                return location;
                
            } else {
                throw new Error('All location detection methods failed');
            }
            
        } catch (error) {
            console.error('Location detection failed completely:', error);
            
            // Return default fallback location
            const fallbackLocation = {
                country: 'US',
                country_name: 'United States',
                region: 'Unknown',
                city: 'Unknown',
                method: 'fallback',
                confidence: 'low',
                error: error.message
            };
            
            this.userLocation = fallbackLocation;
            return fallbackLocation;
        }
    }
    
    /**
     * Enhanced IP-based geolocation with multiple providers
     */
    async getLocationByIP() {
        const providers = [
            {
                url: 'https://ipapi.co/json/',
                parser: (data) => ({
                    country: data.country_code,
                    country_name: data.country_name,
                    region: data.region,
                    region_code: data.region_code,
                    city: data.city,
                    postal: data.postal,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    timezone: data.timezone,
                    method: 'ip_ipapi',
                    confidence: 'high'
                })
            }
        ];
        
        for (const provider of providers) {
            try {
                console.log(`Trying IP geolocation provider: ${provider.url}`);
                
                const response = await fetch(provider.url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'SimpleSwap-Mercuryo-Checkout/1.0'
                    },
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Validate response data
                if (!data.country_code || data.country_code === 'undefined') {
                    throw new Error('Invalid response data');
                }
                
                const location = provider.parser(data);
                console.log('IP geolocation successful:', location);
                return location;
                
            } catch (error) {
                console.warn(`IP provider ${provider.url} failed:`, error);
                continue;
            }
        }
        
        throw new Error('All IP geolocation providers failed');
    }
    
    /**
     * Enhanced browser geolocation with timeout and error handling
     */
    async getLocationByBrowser() {
        if (!navigator.geolocation) {
            throw new Error('Browser geolocation not supported');
        }
        
        return new Promise((resolve, reject) => {
            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            };
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        // In production, would use reverse geocoding service
                        // For demo, approximate based on coordinates
                        const location = this.approximateLocationFromCoords(
                            position.coords.latitude,
                            position.coords.longitude
                        );
                        
                        location.accuracy = position.coords.accuracy;
                        location.method = 'browser_gps';
                        location.confidence = 'medium';
                        
                        resolve(location);
                        
                    } catch (error) {
                        reject(error);
                    }
                },
                (error) => {
                    let message = 'Unknown geolocation error';
                    
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'Geolocation permission denied';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'Position unavailable';
                            break;
                        case error.TIMEOUT:
                            message = 'Geolocation timeout';
                            break;
                    }
                    
                    reject(new Error(message));
                },
                options
            );
        });
    }
    
    /**
     * Approximate location from GPS coordinates
     */
    approximateLocationFromCoords(latitude, longitude) {
        // Simple approximation based on coordinate ranges
        // In production, would use proper reverse geocoding API
        
        if (latitude >= 24.396308 && latitude <= 49.384358 && 
            longitude >= -125.0 && longitude <= -66.93457) {
            return {
                country: 'US',
                country_name: 'United States',
                region: 'Unknown',
                city: 'Unknown',
                latitude,
                longitude
            };
        }
        
        if (latitude >= 41.676 && latitude <= 83.23324 && 
            longitude >= -141.00187 && longitude <= -52.648099) {
            return {
                country: 'CA',
                country_name: 'Canada',
                region: 'Unknown',
                city: 'Unknown',
                latitude,
                longitude
            };
        }
        
        if (latitude >= -54.777 && latitude <= -9.0882 && 
            longitude >= 112.911 && longitude <= 159.278) {
            return {
                country: 'AU',
                country_name: 'Australia',
                region: 'Unknown',
                city: 'Unknown',
                latitude,
                longitude
            };
        }
        
        // Default to US if coordinates don't match known regions
        return {
            country: 'US',
            country_name: 'United States',
            region: 'Unknown',
            city: 'Unknown',
            latitude,
            longitude
        };
    }
    
    /**
     * Enhanced timezone-based location detection
     */
    getLocationByTimezone() {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const mapped = this.timezoneMap[timezone];
            
            if (mapped) {
                return {
                    country: mapped.country,
                    country_name: this.getCountryName(mapped.country),
                    region: mapped.region,
                    timezone,
                    method: 'timezone',
                    confidence: 'medium'
                };
            }
            
            // Fallback: extract country from timezone string
            const parts = timezone.split('/');
            if (parts.length >= 2) {
                const continent = parts[0];
                const city = parts[1];
                
                let country = 'US'; // Default
                
                if (continent === 'America') {
                    if (['Toronto', 'Vancouver', 'Edmonton', 'Winnipeg', 'Halifax'].includes(city)) {
                        country = 'CA';
                    } else {
                        country = 'US';
                    }
                } else if (continent === 'Australia') {
                    country = 'AU';
                }
                
                return {
                    country,
                    country_name: this.getCountryName(country),
                    region: city.replace('_', ' '),
                    timezone,
                    method: 'timezone_fallback',
                    confidence: 'low'
                };
            }
            
            throw new Error('Unable to parse timezone');
            
        } catch (error) {
            console.error('Timezone detection failed:', error);
            throw error;
        }
    }
    
    /**
     * Language-based location detection (last resort)
     */
    getLocationByLanguage() {
        const language = navigator.language || navigator.languages?.[0] || 'en-US';
        const locale = language.toLowerCase();
        
        let country = 'US'; // Default
        
        if (locale.includes('en-ca') || locale.includes('fr-ca')) {
            country = 'CA';
        } else if (locale.includes('en-au')) {
            country = 'AU';
        } else if (locale.includes('en-us') || locale.includes('en')) {
            country = 'US';
        }
        
        return {
            country,
            country_name: this.getCountryName(country),
            region: 'Unknown',
            language: locale,
            method: 'language',
            confidence: 'very_low'
        };
    }
    
    /**
     * Get country name from code
     */
    getCountryName(countryCode) {
        const countryNames = {
            'US': 'United States',
            'CA': 'Canada',
            'AU': 'Australia'
        };
        
        return countryNames[countryCode] || countryCode;
    }
    
    /**
     * Enhanced regional validation with detailed restrictions
     */
    validateRegion(countryCode, regionCode = null) {
        if (!countryCode) {
            return {
                isValid: false,
                reason: 'Country code not provided',
                restrictions: []
            };
        }
        
        const country = countryCode.toUpperCase();
        
        // Check if country is supported
        if (!this.supportedCountries.includes(country)) {
            return {
                isValid: false,
                reason: `Service not available in ${this.getCountryName(country)}`,
                supportedCountries: this.supportedCountries,
                restrictions: []
            };
        }
        
        // Check state/province restrictions
        const restrictions = this.countryRestrictions[country];
        if (restrictions && regionCode) {
            const region = regionCode.toUpperCase();
            
            if (restrictions.excludedStates.includes(region)) {
                return {
                    isValid: false,
                    reason: `Service restricted in ${regionCode}`,
                    restrictions: restrictions.excludedStateNames,
                    country: country
                };
            }
            
            // Check by region name as well
            const regionName = this.userLocation?.region;
            if (regionName && restrictions.excludedStateNames.some(
                excludedName => regionName.toLowerCase().includes(excludedName.toLowerCase())
            )) {
                return {
                    isValid: false,
                    reason: `Service restricted in ${regionName}`,
                    restrictions: restrictions.excludedStateNames,
                    country: country
                };
            }
        }
        
        return {
            isValid: true,
            reason: 'Service available in your region',
            country: country,
            restrictions: restrictions?.excludedStateNames || []
        };
    }
    
    /**
     * Comprehensive regional access validation
     */
    async validateRegionalAccess() {
        try {
            const location = await this.detectUserLocation();
            const validation = this.validateRegion(location.country, location.region_code);
            
            const result = {
                location,
                validation,
                mercuryoAvailable: this.isMercuryoAvailable(location.country),
                timestamp: Date.now(),
                confidence: location.confidence || 'unknown'
            };
            
            console.log('Regional access validation:', result);
            return result;
            
        } catch (error) {
            console.error('Regional validation failed:', error);
            
            return {
                location: this.userLocation || { country: 'US', error: error.message },
                validation: { isValid: false, reason: 'Unable to validate region' },
                mercuryoAvailable: false,
                error: error.message,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * Check Mercuryo availability by region
     */
    isMercuryoAvailable(country) {
        const availability = {
            'US': true,
            'CA': true,
            'AU': true
        };
        
        return availability[country] || false;
    }
    
    /**
     * Handle regional restrictions with user-friendly messages
     */
    handleRegionalRestriction(validationResult) {
        const { validation, location } = validationResult;
        
        if (!validation.isValid) {
            let message = validation.reason;
            let actionable = false;
            
            if (validation.restrictions && validation.restrictions.length > 0) {
                message += `. Restricted areas: ${validation.restrictions.join(', ')}.`;
            }
            
            if (validation.supportedCountries) {
                message += ` Supported regions: ${validation.supportedCountries.map(code => this.getCountryName(code)).join(', ')}.`;
                actionable = true;
            }
            
            return {
                allowed: false,
                message,
                actionable,
                supportedRegions: validation.supportedCountries || [],
                restrictions: validation.restrictions || []
            };
        }
        
        return {
            allowed: true,
            message: `Service available in ${location.country_name || location.country}`,
            actionable: false,
            supportedRegions: this.supportedCountries,
            restrictions: []
        };
    }
    
    /**
     * Utility: delay function for retries
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Clear location cache
     */
    clearCache() {
        this.locationCache.clear();
        this.userLocation = null;
    }
    
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.locationCache.size,
            keys: Array.from(this.locationCache.keys()),
            currentLocation: this.userLocation
        };
    }
    
    /**
     * Force location refresh
     */
    async refreshLocation() {
        this.clearCache();
        return await this.detectUserLocation(false);
    }
}