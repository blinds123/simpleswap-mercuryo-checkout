/**
 * Production Performance Manager
 * Handles performance optimization, monitoring, and resource management
 */
class PerformanceManager {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.thresholds = {
            loadTime: 3000,
            interactionTime: 1000,
            memoryUsage: 50 * 1024 * 1024, // 50MB
            bundleSize: 500 * 1024 // 500KB
        };
        
        this.initializeMonitoring();
    }
    
    /**
     * Initialize performance monitoring
     */
    initializeMonitoring() {
        // Page load performance
        window.addEventListener('load', () => {
            this.measurePageLoad();
        });
        
        // Interaction performance
        this.setupInteractionMonitoring();
        
        // Memory usage monitoring
        this.setupMemoryMonitoring();
        
        // Network performance
        this.setupNetworkMonitoring();
    }
    
    /**
     * Measure page load performance
     */
    measurePageLoad() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        const metrics = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
        };
        
        this.metrics.set('pageLoad', metrics);
        
        // Check thresholds
        if (metrics.totalLoadTime > this.thresholds.loadTime) {
            console.warn(`Page load time exceeded threshold: ${metrics.totalLoadTime}ms`);
        }
        
        console.log('Page Load Metrics:', metrics);
    }
    
    /**
     * Setup interaction monitoring
     */
    setupInteractionMonitoring() {
        const interactionObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > this.thresholds.interactionTime) {
                    console.warn(`Slow interaction detected: ${entry.duration}ms`);
                }
                
                this.recordMetric('interactions', {
                    type: entry.name,
                    duration: entry.duration,
                    startTime: entry.startTime,
                    timestamp: Date.now()
                });
            }
        });
        
        try {
            interactionObserver.observe({ entryTypes: ['event'] });
            this.observers.set('interaction', interactionObserver);
        } catch (error) {
            console.log('Event timing not supported');
        }
    }
    
    /**
     * Setup memory monitoring
     */
    setupMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const metrics = {
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };
                
                this.recordMetric('memory', metrics);
                
                if (metrics.used > this.thresholds.memoryUsage) {
                    console.warn(`Memory usage exceeded threshold: ${metrics.used / 1024 / 1024}MB`);
                }
            }, 30000); // Check every 30 seconds
        }
    }
    
    /**
     * Setup network monitoring
     */
    setupNetworkMonitoring() {
        const networkObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name.includes('api') || entry.name.includes('exchange')) {
                    this.recordMetric('network', {
                        url: entry.name,
                        duration: entry.duration,
                        transferSize: entry.transferSize,
                        responseStart: entry.responseStart,
                        responseEnd: entry.responseEnd,
                        timestamp: Date.now()
                    });
                }
            }
        });
        
        try {
            networkObserver.observe({ entryTypes: ['resource'] });
            this.observers.set('network', networkObserver);
        } catch (error) {
            console.log('Resource timing not supported');
        }
    }
    
    /**
     * Record performance metric
     */
    recordMetric(category, data) {
        if (!this.metrics.has(category)) {
            this.metrics.set(category, []);
        }
        
        const categoryMetrics = this.metrics.get(category);
        categoryMetrics.push(data);
        
        // Keep only last 100 entries
        if (categoryMetrics.length > 100) {
            categoryMetrics.shift();
        }
    }
    
    /**
     * Optimize images for different device types
     */
    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Lazy loading
            if ('loading' in HTMLImageElement.prototype) {
                img.loading = 'lazy';
            } else {
                // Fallback for older browsers
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const image = entry.target;
                            image.src = image.dataset.src;
                            imageObserver.unobserve(image);
                        }
                    });
                });
                
                imageObserver.observe(img);
            }
        });
    }
    
    /**
     * Implement resource caching
     */
    implementCaching() {
        // Service worker registration for caching
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('Service worker registered:', registration);
            }).catch(error => {
                console.error('Service worker registration failed:', error);
            });
        }
        
        // In-memory caching for API responses
        const cache = new Map();
        const originalFetch = window.fetch;
        
        window.fetch = function(url, options = {}) {
            const cacheKey = `${url}_${JSON.stringify(options)}`;
            
            if (options.method === 'GET' && cache.has(cacheKey)) {
                const cached = cache.get(cacheKey);
                const maxAge = 60000; // 1 minute
                
                if (Date.now() - cached.timestamp < maxAge) {
                    return Promise.resolve(cached.response.clone());
                }
            }
            
            return originalFetch(url, options).then(response => {
                if (options.method === 'GET' && response.ok) {
                    cache.set(cacheKey, {
                        response: response.clone(),
                        timestamp: Date.now()
                    });
                }
                return response;
            });
        };
    }
    
    /**
     * Optimize bundle size
     */
    optimizeBundleSize() {
        // Dynamic imports for non-critical features
        const loadAnalytics = () => {
            return import('./analytics.js').then(module => {
                return module.default;
            });
        };
        
        // Defer non-critical scripts
        const deferredScripts = document.querySelectorAll('script[defer]');
        deferredScripts.forEach(script => {
            script.addEventListener('load', () => {
                console.log(`Deferred script loaded: ${script.src}`);
            });
        });
    }
    
    /**
     * Monitor Core Web Vitals
     */
    monitorCoreWebVitals() {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcp = entries[entries.length - 1];
            
            this.recordMetric('coreWebVitals', {
                type: 'LCP',
                value: lcp.startTime,
                timestamp: Date.now()
            });
        });
        
        try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('lcp', lcpObserver);
        } catch (error) {
            console.log('LCP measurement not supported');
        }
        
        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            
            this.recordMetric('coreWebVitals', {
                type: 'CLS',
                value: clsValue,
                timestamp: Date.now()
            });
        });
        
        try {
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('cls', clsObserver);
        } catch (error) {
            console.log('CLS measurement not supported');
        }
    }
    
    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        const summary = {};
        
        this.metrics.forEach((value, key) => {
            summary[key] = {
                count: value.length,
                recent: value.slice(-10) // Last 10 entries
            };
        });
        
        return summary;
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        this.observers.forEach((observer, key) => {
            observer.disconnect();
        });
        this.observers.clear();
        this.metrics.clear();
    }
}