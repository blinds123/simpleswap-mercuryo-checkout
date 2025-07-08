/**
 * Performance Testing and Core Web Vitals Validation
 * Comprehensive performance metrics testing and optimization validation
 */
class PerformanceTestSuite {
    constructor() {
        this.testResults = [];
        this.metrics = new Map();
        this.thresholds = {
            // Core Web Vitals thresholds
            LCP: 2500, // Largest Contentful Paint (ms)
            FID: 100,  // First Input Delay (ms)
            CLS: 0.1,  // Cumulative Layout Shift
            
            // Page Performance thresholds
            loadTime: 3000,
            domContentLoaded: 2000,
            firstPaint: 1000,
            firstContentfulPaint: 1500,
            
            // Resource thresholds
            memoryUsage: 50 * 1024 * 1024, // 50MB
            resourceCount: 50,
            totalResourceSize: 5 * 1024 * 1024, // 5MB
            
            // API Performance thresholds
            apiResponseTime: 5000,
            apiSuccessRate: 95
        };
        
        this.performanceEntries = [];
        this.webVitalsData = {};
        
        this.initializePerformanceTesting();
    }
    
    /**
     * Initialize performance testing
     */
    async initializePerformanceTesting() {
        console.log('🚀 Starting Performance Testing...');
        
        try {
            // Collect baseline metrics
            await this.collectBaselineMetrics();
            
            // Run all performance tests
            await this.runAllPerformanceTests();
            
            // Generate performance report
            this.generatePerformanceReport();
            
        } catch (error) {
            console.error('Performance testing failed:', error);
            this.testResults.push({
                name: 'Performance Testing Initialization',
                status: 'ERROR',
                error: error.message
            });
        }
    }
    
    /**
     * Collect baseline performance metrics
     */
    async collectBaselineMetrics() {
        console.log('📊 Collecting baseline metrics...');
        
        // Navigation timing
        if (performance.timing) {
            const nav = performance.timing;
            this.metrics.set('navigationStart', nav.navigationStart);
            this.metrics.set('domContentLoaded', nav.domContentLoadedEventEnd - nav.navigationStart);
            this.metrics.set('loadComplete', nav.loadEventEnd - nav.navigationStart);
            this.metrics.set('domInteractive', nav.domInteractive - nav.navigationStart);
        }
        
        // Paint timing
        const paintEntries = performance.getEntriesByType('paint');
        for (const entry of paintEntries) {
            this.metrics.set(entry.name.replace('-', ''), entry.startTime);
        }
        
        // Memory usage
        if (performance.memory) {
            this.metrics.set('memoryUsed', performance.memory.usedJSHeapSize);
            this.metrics.set('memoryTotal', performance.memory.totalJSHeapSize);
            this.metrics.set('memoryLimit', performance.memory.jsHeapSizeLimit);
        }
        
        // Resource entries
        const resourceEntries = performance.getEntriesByType('resource');
        this.performanceEntries = resourceEntries;
        
        console.log('✅ Baseline metrics collected');
    }
    
    /**
     * Run all performance tests
     */
    async runAllPerformanceTests() {
        const tests = [
            { name: 'Core Web Vitals', fn: () => this.testCoreWebVitals() },
            { name: 'Page Load Performance', fn: () => this.testPageLoadPerformance() },
            { name: 'Memory Usage', fn: () => this.testMemoryUsage() },
            { name: 'Resource Loading', fn: () => this.testResourceLoading() },
            { name: 'Performance Manager Integration', fn: () => this.testPerformanceManagerIntegration() },
            { name: 'API Performance', fn: () => this.testAPIPerformance() },
            { name: 'Caching Effectiveness', fn: () => this.testCachingEffectiveness() },
            { name: 'Mobile Performance', fn: () => this.testMobilePerformance() },
            { name: 'Performance Monitoring', fn: () => this.testPerformanceMonitoring() },
            { name: 'Optimization Validation', fn: () => this.testOptimizationValidation() }
        ];
        
        for (const test of tests) {
            try {
                console.log(`Testing: ${test.name}`);
                const result = await test.fn();
                this.testResults.push({
                    name: test.name,
                    status: result.passed ? 'PASS' : 'FAIL',
                    details: result.details || [],
                    metrics: result.metrics || {},
                    warnings: result.warnings || [],
                    errors: result.errors || []
                });
            } catch (error) {
                console.error(`Test ${test.name} failed:`, error);
                this.testResults.push({
                    name: test.name,
                    status: 'ERROR',
                    error: error.message,
                    details: [],
                    metrics: {},
                    warnings: [],
                    errors: [error.message]
                });
            }
        }
    }
    
    /**
     * Test Core Web Vitals
     */
    async testCoreWebVitals() {
        console.log('🔍 Testing Core Web Vitals...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        const metrics = {};
        
        try {
            // Test Largest Contentful Paint (LCP)
            await this.measureLCP().then(lcp => {
                if (lcp !== null) {
                    metrics.LCP = lcp;
                    const passed = lcp <= this.thresholds.LCP;
                    
                    if (passed) {
                        details.push(`✅ LCP: ${lcp.toFixed(0)}ms (Good: ≤${this.thresholds.LCP}ms)`);
                    } else if (lcp <= 4000) {
                        warnings.push(`⚠️ LCP: ${lcp.toFixed(0)}ms (Needs Improvement: ≤4000ms)`);
                    } else {
                        errors.push(`❌ LCP: ${lcp.toFixed(0)}ms (Poor: >${this.thresholds.LCP}ms)`);
                    }
                } else {
                    warnings.push('LCP measurement not available');
                }
            });
            
            // Test First Input Delay (FID)
            await this.measureFID().then(fid => {
                if (fid !== null) {
                    metrics.FID = fid;
                    const passed = fid <= this.thresholds.FID;
                    
                    if (passed) {
                        details.push(`✅ FID: ${fid.toFixed(0)}ms (Good: ≤${this.thresholds.FID}ms)`);
                    } else if (fid <= 300) {
                        warnings.push(`⚠️ FID: ${fid.toFixed(0)}ms (Needs Improvement: ≤300ms)`);
                    } else {
                        errors.push(`❌ FID: ${fid.toFixed(0)}ms (Poor: >${this.thresholds.FID}ms)`);
                    }
                } else {
                    warnings.push('FID measurement not available (requires user interaction)');
                }
            });
            
            // Test Cumulative Layout Shift (CLS)
            await this.measureCLS().then(cls => {
                if (cls !== null) {
                    metrics.CLS = cls;
                    const passed = cls <= this.thresholds.CLS;
                    
                    if (passed) {
                        details.push(`✅ CLS: ${cls.toFixed(3)} (Good: ≤${this.thresholds.CLS})`);
                    } else if (cls <= 0.25) {
                        warnings.push(`⚠️ CLS: ${cls.toFixed(3)} (Needs Improvement: ≤0.25)`);
                    } else {
                        errors.push(`❌ CLS: ${cls.toFixed(3)} (Poor: >${this.thresholds.CLS})`);
                    }
                } else {
                    warnings.push('CLS measurement not available');
                }
            });
            
            // Additional Web Vitals
            const fcpValue = this.metrics.get('first-contentful-paint');
            if (fcpValue) {
                metrics.FCP = fcpValue;
                if (fcpValue <= this.thresholds.firstContentfulPaint) {
                    details.push(`✅ FCP: ${fcpValue.toFixed(0)}ms (Good: ≤${this.thresholds.firstContentfulPaint}ms)`);
                } else {
                    warnings.push(`⚠️ FCP: ${fcpValue.toFixed(0)}ms (Target: ≤${this.thresholds.firstContentfulPaint}ms)`);
                }
            }
            
        } catch (error) {
            errors.push(`Core Web Vitals measurement error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings,
            metrics
        };
    }
    
    /**
     * Test page load performance
     */
    testPageLoadPerformance() {
        console.log('🔍 Testing Page Load Performance...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        const metrics = {};
        
        try {
            // DOM Content Loaded
            const domContentLoaded = this.metrics.get('domContentLoaded');
            if (domContentLoaded) {
                metrics.domContentLoaded = domContentLoaded;
                if (domContentLoaded <= this.thresholds.domContentLoaded) {
                    details.push(`✅ DOM Content Loaded: ${domContentLoaded.toFixed(0)}ms`);
                } else {
                    warnings.push(`⚠️ DOM Content Loaded: ${domContentLoaded.toFixed(0)}ms (Target: ≤${this.thresholds.domContentLoaded}ms)`);
                }
            }
            
            // Load Complete
            const loadComplete = this.metrics.get('loadComplete');
            if (loadComplete) {
                metrics.loadComplete = loadComplete;
                if (loadComplete <= this.thresholds.loadTime) {
                    details.push(`✅ Load Complete: ${loadComplete.toFixed(0)}ms`);
                } else {
                    errors.push(`❌ Load Complete: ${loadComplete.toFixed(0)}ms (Target: ≤${this.thresholds.loadTime}ms)`);
                }
            }
            
            // First Paint
            const firstPaint = this.metrics.get('first-paint');
            if (firstPaint) {
                metrics.firstPaint = firstPaint;
                if (firstPaint <= this.thresholds.firstPaint) {
                    details.push(`✅ First Paint: ${firstPaint.toFixed(0)}ms`);
                } else {
                    warnings.push(`⚠️ First Paint: ${firstPaint.toFixed(0)}ms (Target: ≤${this.thresholds.firstPaint}ms)`);
                }
            }
            
            // Performance score calculation
            let performanceScore = 100;
            if (loadComplete > this.thresholds.loadTime) performanceScore -= 20;
            if (domContentLoaded > this.thresholds.domContentLoaded) performanceScore -= 15;
            if (firstPaint > this.thresholds.firstPaint) performanceScore -= 10;
            
            metrics.performanceScore = Math.max(performanceScore, 0);
            details.push(`📊 Performance Score: ${metrics.performanceScore}/100`);
            
        } catch (error) {
            errors.push(`Page load performance test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings,
            metrics
        };
    }
    
    /**
     * Test memory usage
     */
    testMemoryUsage() {
        console.log('🔍 Testing Memory Usage...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        const metrics = {};
        
        try {
            if (performance.memory) {
                const memoryUsed = performance.memory.usedJSHeapSize;
                const memoryTotal = performance.memory.totalJSHeapSize;
                const memoryLimit = performance.memory.jsHeapSizeLimit;
                
                metrics.memoryUsed = memoryUsed;
                metrics.memoryTotal = memoryTotal;
                metrics.memoryLimit = memoryLimit;
                
                const memoryUsedMB = memoryUsed / (1024 * 1024);
                const memoryLimitMB = memoryLimit / (1024 * 1024);
                const memoryPercent = (memoryUsed / memoryLimit) * 100;
                
                details.push(`📊 Memory Used: ${memoryUsedMB.toFixed(1)}MB / ${memoryLimitMB.toFixed(0)}MB (${memoryPercent.toFixed(1)}%)`);
                
                if (memoryUsed <= this.thresholds.memoryUsage) {
                    details.push(`✅ Memory usage within threshold`);
                } else {
                    errors.push(`❌ Memory usage exceeds threshold: ${memoryUsedMB.toFixed(1)}MB > ${(this.thresholds.memoryUsage / 1024 / 1024).toFixed(0)}MB`);
                }
                
                // Memory efficiency check
                const efficiency = (memoryUsed / memoryTotal) * 100;
                metrics.memoryEfficiency = efficiency;
                
                if (efficiency < 80) {
                    details.push(`✅ Memory efficiency: ${efficiency.toFixed(1)}%`);
                } else {
                    warnings.push(`⚠️ Memory efficiency could be improved: ${efficiency.toFixed(1)}%`);
                }
                
            } else {
                warnings.push('Memory API not available in this browser');
            }
            
            // Test for memory leaks (basic check)
            this.checkMemoryLeaks().then(leakData => {
                if (leakData.detected) {
                    errors.push(`❌ Potential memory leak detected: ${leakData.description}`);
                } else {
                    details.push(`✅ No obvious memory leaks detected`);
                }
            });
            
        } catch (error) {
            errors.push(`Memory usage test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings,
            metrics
        };
    }
    
    /**
     * Test resource loading performance
     */
    testResourceLoading() {
        console.log('🔍 Testing Resource Loading...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        const metrics = {};
        
        try {
            const resources = this.performanceEntries;
            
            if (resources.length === 0) {
                warnings.push('No resource entries available');
                return { passed: true, details, errors, warnings, metrics };
            }
            
            // Resource count analysis
            metrics.resourceCount = resources.length;
            details.push(`📊 Total Resources: ${resources.length}`);
            
            if (resources.length > this.thresholds.resourceCount) {
                warnings.push(`⚠️ High resource count: ${resources.length} (Consider optimization)`);
            } else {
                details.push(`✅ Resource count within reasonable limits`);
            }
            
            // Resource size analysis
            const totalSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
            metrics.totalResourceSize = totalSize;
            
            const totalSizeMB = totalSize / (1024 * 1024);
            details.push(`📊 Total Resource Size: ${totalSizeMB.toFixed(2)}MB`);
            
            if (totalSize > this.thresholds.totalResourceSize) {
                warnings.push(`⚠️ Large total resource size: ${totalSizeMB.toFixed(2)}MB`);
            } else {
                details.push(`✅ Total resource size optimized`);
            }
            
            // Slow resource analysis
            const slowResources = resources.filter(resource => resource.duration > 2000);
            metrics.slowResourceCount = slowResources.length;
            
            if (slowResources.length === 0) {
                details.push(`✅ No slow-loading resources detected`);
            } else {
                warnings.push(`⚠️ ${slowResources.length} slow-loading resources detected`);
                slowResources.forEach(resource => {
                    details.push(`  📁 Slow: ${resource.name} (${resource.duration.toFixed(0)}ms)`);
                });
            }
            
            // Resource type breakdown
            const resourceTypes = {};
            resources.forEach(resource => {
                const type = resource.initiatorType || 'other';
                resourceTypes[type] = (resourceTypes[type] || 0) + 1;
            });
            
            metrics.resourceTypes = resourceTypes;
            details.push(`📊 Resource Types: ${Object.entries(resourceTypes).map(([type, count]) => `${type}:${count}`).join(', ')}`);
            
        } catch (error) {
            errors.push(`Resource loading test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings,
            metrics
        };
    }
    
    /**
     * Test Performance Manager integration
     */
    testPerformanceManagerIntegration() {
        console.log('🔍 Testing Performance Manager Integration...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        const metrics = {};
        
        try {
            // Check if PerformanceManager class exists
            if (typeof PerformanceManager === 'undefined') {
                errors.push('PerformanceManager class not available');
                return { passed: false, details, errors, warnings, metrics };
            }
            
            details.push('✅ PerformanceManager class available');
            
            // Check if performance manager instance exists
            if (window.performanceManager) {
                details.push('✅ Performance manager instance exists');
                
                // Test performance manager methods
                const requiredMethods = [
                    'measurePageLoad',
                    'monitorCoreWebVitals',
                    'getPerformanceSummary',
                    'optimizeImages',
                    'implementCaching'
                ];
                
                for (const method of requiredMethods) {
                    if (typeof window.performanceManager[method] === 'function') {
                        details.push(`✅ Method available: ${method}`);
                    } else {
                        errors.push(`❌ Method missing: ${method}`);
                    }
                }
                
                // Test performance summary
                try {
                    const summary = window.performanceManager.getPerformanceSummary();
                    if (summary && typeof summary === 'object') {
                        details.push('✅ Performance summary generation works');
                        metrics.performanceSummary = Object.keys(summary);
                    } else {
                        warnings.push('Performance summary format unexpected');
                    }
                } catch (error) {
                    errors.push(`Performance summary error: ${error.message}`);
                }
                
            } else {
                warnings.push('Performance manager instance not found in global scope');
            }
            
        } catch (error) {
            errors.push(`Performance manager integration test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings,
            metrics
        };
    }
    
    /**
     * Test API performance
     */
    async testAPIPerformance() {
        console.log('🔍 Testing API Performance...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        const metrics = {};
        
        try {
            // Check if APIManager exists
            if (typeof APIManager === 'undefined') {
                errors.push('APIManager class not available');
                return { passed: false, details, errors, warnings, metrics };
            }
            
            details.push('✅ APIManager class available');
            
            // Test API manager instance
            if (window.apiManager) {
                details.push('✅ API manager instance exists');
                
                // Get cache statistics
                try {
                    const cacheStats = window.apiManager.getCacheStats();
                    if (cacheStats) {
                        details.push(`✅ API cache operational (${cacheStats.size} entries)`);
                        metrics.apiCacheSize = cacheStats.size;
                    }
                } catch (error) {
                    warnings.push(`API cache stats error: ${error.message}`);
                }
                
                // Test rate limiting
                if (typeof window.apiManager.isRateLimited === 'function') {
                    details.push('✅ Rate limiting functionality available');
                } else {
                    warnings.push('Rate limiting functionality not found');
                }
                
            } else {
                warnings.push('API manager instance not found in global scope');
            }
            
            // Mock API performance test
            const mockAPITest = await this.performMockAPITest();
            if (mockAPITest.responseTime < this.thresholds.apiResponseTime) {
                details.push(`✅ Mock API response time: ${mockAPITest.responseTime}ms`);
            } else {
                warnings.push(`⚠️ Mock API response time: ${mockAPITest.responseTime}ms (slow)`);
            }
            
            metrics.mockApiResponseTime = mockAPITest.responseTime;
            
        } catch (error) {
            errors.push(`API performance test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings,
            metrics
        };
    }
    
    /**
     * Test caching effectiveness
     */
    testCachingEffectiveness() {
        console.log('🔍 Testing Caching Effectiveness...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        const metrics = {};
        
        try {
            // Check browser cache headers
            const resources = this.performanceEntries;
            const cacheableResources = resources.filter(resource => {
                const url = resource.name;
                return url.includes('.css') || url.includes('.js') || url.includes('.png') || url.includes('.jpg');
            });
            
            metrics.cacheableResourceCount = cacheableResources.length;
            details.push(`📊 Cacheable resources found: ${cacheableResources.length}`);
            
            // Check for service worker
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    if (registrations.length > 0) {
                        details.push('✅ Service worker registered for caching');
                        metrics.serviceWorkerActive = true;
                    } else {
                        warnings.push('⚠️ No service worker found for advanced caching');
                        metrics.serviceWorkerActive = false;
                    }
                });
            } else {
                warnings.push('Service worker not supported in this browser');
            }
            
            // Check localStorage usage for caching
            try {
                const localStorageItems = Object.keys(localStorage).length;
                metrics.localStorageItems = localStorageItems;
                details.push(`📊 LocalStorage items: ${localStorageItems}`);
            } catch (error) {
                warnings.push('LocalStorage access restricted');
            }
            
        } catch (error) {
            errors.push(`Caching effectiveness test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings,
            metrics
        };
    }
    
    /**
     * Test mobile performance considerations
     */
    testMobilePerformance() {
        console.log('🔍 Testing Mobile Performance...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        const metrics = {};
        
        try {
            // Check viewport configuration
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            if (viewportMeta) {
                details.push('✅ Viewport meta tag configured');
                metrics.viewportConfigured = true;
            } else {
                errors.push('❌ Viewport meta tag missing');
                metrics.viewportConfigured = false;
            }
            
            // Check touch optimization
            const touchCSS = Array.from(document.styleSheets).some(sheet => {
                try {
                    return Array.from(sheet.cssRules).some(rule => 
                        rule.media && rule.media.mediaText.includes('hover: none')
                    );
                } catch (e) {
                    return false;
                }
            });
            
            if (touchCSS) {
                details.push('✅ Touch-optimized CSS detected');
                metrics.touchOptimized = true;
            } else {
                warnings.push('⚠️ Touch optimization CSS not detected');
                metrics.touchOptimized = false;
            }
            
            // Check responsive design
            const mediaQueries = Array.from(document.styleSheets).reduce((count, sheet) => {
                try {
                    return count + Array.from(sheet.cssRules).filter(rule => 
                        rule.media && rule.media.mediaText.includes('max-width')
                    ).length;
                } catch (e) {
                    return count;
                }
            }, 0);
            
            metrics.mediaQueryCount = mediaQueries;
            if (mediaQueries > 0) {
                details.push(`✅ Responsive design detected (${mediaQueries} media queries)`);
            } else {
                warnings.push('⚠️ No responsive design media queries detected');
            }
            
            // Check PWA features
            const manifestLink = document.querySelector('link[rel="manifest"]');
            if (manifestLink) {
                details.push('✅ PWA manifest linked');
                metrics.pwaManifest = true;
            } else {
                warnings.push('⚠️ PWA manifest not found');
                metrics.pwaManifest = false;
            }
            
        } catch (error) {
            errors.push(`Mobile performance test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings,
            metrics
        };
    }
    
    /**
     * Test performance monitoring setup
     */
    testPerformanceMonitoring() {
        console.log('🔍 Testing Performance Monitoring...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        const metrics = {};
        
        try {
            // Check monitoring integration
            if (window.monitoring && window.monitoring.components) {
                details.push('✅ Monitoring integration available');
                
                if (window.monitoring.components.performance) {
                    details.push('✅ Performance monitoring component active');
                    metrics.performanceMonitoringActive = true;
                } else {
                    warnings.push('⚠️ Performance monitoring component not found');
                    metrics.performanceMonitoringActive = false;
                }
            } else {
                warnings.push('⚠️ Monitoring integration not found');
            }
            
            // Check PerformanceObserver support
            if ('PerformanceObserver' in window) {
                details.push('✅ PerformanceObserver API supported');
                metrics.performanceObserverSupported = true;
            } else {
                warnings.push('⚠️ PerformanceObserver API not supported');
                metrics.performanceObserverSupported = false;
            }
            
            // Check performance entries
            const performanceEntries = performance.getEntries();
            metrics.performanceEntriesCount = performanceEntries.length;
            details.push(`📊 Performance entries available: ${performanceEntries.length}`);
            
        } catch (error) {
            errors.push(`Performance monitoring test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings,
            metrics
        };
    }
    
    /**
     * Test optimization validation
     */
    testOptimizationValidation() {
        console.log('🔍 Testing Optimization Validation...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        const metrics = {};
        
        try {
            // Check image optimization
            const images = document.querySelectorAll('img');
            let optimizedImages = 0;
            
            images.forEach(img => {
                if (img.loading === 'lazy' || img.getAttribute('loading') === 'lazy') {
                    optimizedImages++;
                }
            });
            
            metrics.totalImages = images.length;
            metrics.optimizedImages = optimizedImages;
            
            if (images.length > 0) {
                const optimizationRate = (optimizedImages / images.length) * 100;
                details.push(`📊 Image optimization: ${optimizationRate.toFixed(1)}% (${optimizedImages}/${images.length})`);
                
                if (optimizationRate > 80) {
                    details.push('✅ Good image optimization');
                } else {
                    warnings.push('⚠️ Image optimization could be improved');
                }
            } else {
                details.push('📊 No images found to optimize');
            }
            
            // Check script optimization
            const scripts = document.querySelectorAll('script');
            let asyncScripts = 0;
            let deferScripts = 0;
            
            scripts.forEach(script => {
                if (script.async) asyncScripts++;
                if (script.defer) deferScripts++;
            });
            
            metrics.totalScripts = scripts.length;
            metrics.asyncScripts = asyncScripts;
            metrics.deferScripts = deferScripts;
            
            const optimizedScripts = asyncScripts + deferScripts;
            const scriptOptimizationRate = scripts.length > 0 ? (optimizedScripts / scripts.length) * 100 : 100;
            
            details.push(`📊 Script optimization: ${scriptOptimizationRate.toFixed(1)}% (${optimizedScripts}/${scripts.length})`);
            
            if (scriptOptimizationRate > 50) {
                details.push('✅ Good script loading optimization');
            } else {
                warnings.push('⚠️ Script loading optimization could be improved');
            }
            
            // Check CSS optimization
            const styleSheets = document.querySelectorAll('link[rel="stylesheet"]');
            metrics.totalStyleSheets = styleSheets.length;
            details.push(`📊 CSS files: ${styleSheets.length}`);
            
            if (styleSheets.length <= 3) {
                details.push('✅ Reasonable number of CSS files');
            } else {
                warnings.push('⚠️ Consider combining CSS files for better performance');
            }
            
        } catch (error) {
            errors.push(`Optimization validation test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings,
            metrics
        };
    }
    
    /**
     * Helper methods for Core Web Vitals measurement
     */
    async measureLCP() {
        return new Promise((resolve) => {
            if ('PerformanceObserver' in window) {
                try {
                    const observer = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const lcp = entries[entries.length - 1];
                        observer.disconnect();
                        resolve(lcp.startTime);
                    });
                    observer.observe({ entryTypes: ['largest-contentful-paint'] });
                    
                    // Timeout after 5 seconds
                    setTimeout(() => {
                        observer.disconnect();
                        resolve(null);
                    }, 5000);
                } catch (error) {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    }
    
    async measureFID() {
        return new Promise((resolve) => {
            if ('PerformanceObserver' in window) {
                try {
                    const observer = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const fid = entries[0];
                        observer.disconnect();
                        resolve(fid.processingStart - fid.startTime);
                    });
                    observer.observe({ entryTypes: ['first-input'] });
                    
                    // Timeout after 10 seconds
                    setTimeout(() => {
                        observer.disconnect();
                        resolve(null);
                    }, 10000);
                } catch (error) {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    }
    
    async measureCLS() {
        return new Promise((resolve) => {
            if ('PerformanceObserver' in window) {
                try {
                    let clsValue = 0;
                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (!entry.hadRecentInput) {
                                clsValue += entry.value;
                            }
                        }
                    });
                    observer.observe({ entryTypes: ['layout-shift'] });
                    
                    // Measure for 5 seconds
                    setTimeout(() => {
                        observer.disconnect();
                        resolve(clsValue);
                    }, 5000);
                } catch (error) {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    }
    
    async checkMemoryLeaks() {
        // Simple memory leak detection
        const initialMemory = performance.memory?.usedJSHeapSize || 0;
        
        // Wait 2 seconds and check again
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const finalMemory = performance.memory?.usedJSHeapSize || 0;
        const memoryIncrease = finalMemory - initialMemory;
        
        // If memory increased by more than 10MB in 2 seconds, flag as potential leak
        return {
            detected: memoryIncrease > 10 * 1024 * 1024,
            description: `Memory increased by ${(memoryIncrease / 1024 / 1024).toFixed(1)}MB in 2 seconds`,
            increase: memoryIncrease
        };
    }
    
    async performMockAPITest() {
        const startTime = performance.now();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        
        const endTime = performance.now();
        
        return {
            responseTime: endTime - startTime,
            success: true
        };
    }
    
    /**
     * Generate comprehensive performance report
     */
    generatePerformanceReport() {
        console.log('\n🚀 PERFORMANCE TEST REPORT');
        console.log('=' .repeat(60));
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.status === 'PASS').length;
        const failedTests = this.testResults.filter(test => test.status === 'FAIL').length;
        const errorTests = this.testResults.filter(test => test.status === 'ERROR').length;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Errors: ${errorTests} ⚠️`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        console.log('\nDETAILED RESULTS:');
        console.log('-' .repeat(40));
        
        for (const test of this.testResults) {
            const statusIcon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
            console.log(`\n${statusIcon} ${test.name} - ${test.status}`);
            
            if (test.details && test.details.length > 0) {
                test.details.forEach(detail => console.log(`  ${detail}`));
            }
            
            if (test.warnings && test.warnings.length > 0) {
                test.warnings.forEach(warning => console.log(`  ${warning}`));
            }
            
            if (test.errors && test.errors.length > 0) {
                test.errors.forEach(error => console.log(`  ${error}`));
            }
            
            if (test.metrics && Object.keys(test.metrics).length > 0) {
                console.log(`  📊 Metrics: ${JSON.stringify(test.metrics, null, 2).replace(/\n/g, '\n  ')}`);
            }
        }
        
        // Performance recommendations
        console.log('\nPERFORMANCE RECOMMENDATIONS:');
        console.log('-' .repeat(40));
        
        const allWarnings = this.testResults.flatMap(test => test.warnings || []);
        const allErrors = this.testResults.flatMap(test => test.errors || []);
        
        if (allErrors.length === 0 && allWarnings.length === 0) {
            console.log('🎉 Excellent performance! All tests passed without issues.');
        } else {
            if (allErrors.length > 0) {
                console.log('\nCRITICAL PERFORMANCE ISSUES:');
                allErrors.forEach(error => console.log(`  🚨 ${error}`));
            }
            
            if (allWarnings.length > 0) {
                console.log('\nPERFORMANCE OPTIMIZATIONS:');
                allWarnings.forEach(warning => console.log(`  💡 ${warning}`));
            }
        }
        
        // Performance grade
        const performanceScore = (passedTests / totalTests) * 100;
        let performanceGrade = 'F';
        
        if (performanceScore >= 95) performanceGrade = 'A+';
        else if (performanceScore >= 90) performanceGrade = 'A';
        else if (performanceScore >= 85) performanceGrade = 'B+';
        else if (performanceScore >= 80) performanceGrade = 'B';
        else if (performanceScore >= 75) performanceGrade = 'C+';
        else if (performanceScore >= 70) performanceGrade = 'C';
        else if (performanceScore >= 60) performanceGrade = 'D';
        
        console.log(`\n🏆 PERFORMANCE GRADE: ${performanceGrade} (${performanceScore.toFixed(1)}%)`);
        console.log('=' .repeat(60));
        
        return {
            totalTests,
            passedTests,
            failedTests,
            errorTests,
            performanceScore,
            performanceGrade,
            testResults: this.testResults
        };
    }
    
    /**
     * Get test results
     */
    getResults() {
        return {
            testResults: this.testResults,
            metrics: Object.fromEntries(this.metrics),
            webVitalsData: this.webVitalsData
        };
    }
}

// Auto-initialize if this script is loaded
if (typeof window !== 'undefined') {
    window.PerformanceTestSuite = PerformanceTestSuite;
    
    // Auto-run if performance testing parameter is present
    if (new URLSearchParams(window.location.search).has('test-performance')) {
        document.addEventListener('DOMContentLoaded', () => {
            new PerformanceTestSuite();
        });
    }
}