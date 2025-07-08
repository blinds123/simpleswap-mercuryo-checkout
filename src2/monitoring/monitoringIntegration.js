/**
 * Production Monitoring Integration
 * Central orchestrator for all monitoring components
 */
class MonitoringIntegration {
    constructor(config = {}) {
        this.config = config;
        this.isEnabled = config.FEATURES?.ENABLE_PERFORMANCE_MONITORING || false;
        this.components = {};
        this.healthStatus = 'initializing';
        this.alerts = [];
        this.metrics = new Map();
        
        this.initializeMonitoring();
    }
    
    /**
     * Initialize all monitoring components
     */
    async initializeMonitoring() {
        if (!this.isEnabled) {
            console.log('Monitoring integration disabled by configuration');
            return;
        }
        
        try {
            console.log('Initializing monitoring integration...');
            
            // Initialize analytics
            this.components.analytics = new AnalyticsManager(this.config);
            
            // Initialize error monitoring
            this.components.errorMonitor = new ErrorMonitor(this.config);
            
            // Initialize dashboard (if in debug mode)
            if (this.config.FEATURES?.DEBUG_MODE || this.shouldShowDashboard()) {
                this.components.dashboard = new MonitoringDashboard(this.config);
            }
            
            // Setup global references for component integration
            this.setupGlobalReferences();
            
            // Setup monitoring workflows
            this.setupMonitoringWorkflows();
            
            // Setup health monitoring
            this.setupHealthMonitoring();
            
            // Setup alert management
            this.setupAlertManagement();
            
            // Track initialization
            this.trackEvent('monitoring_initialized', {
                components: Object.keys(this.components),
                config: this.sanitizeConfig()
            });
            
            this.healthStatus = 'healthy';
            console.log('Monitoring integration initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize monitoring:', error);
            this.healthStatus = 'failed';
            throw error;
        }
    }
    
    /**
     * Setup global references for cross-component integration
     */
    setupGlobalReferences() {
        // Make components globally accessible for integration
        window.analyticsManager = this.components.analytics;
        window.errorMonitor = this.components.errorMonitor;
        window.monitoringDashboard = this.components.dashboard;
        window.monitoringIntegration = this;
        
        // Set session start time for analytics
        if (!window.sessionStartTime) {
            window.sessionStartTime = Date.now();
        }
    }
    
    /**
     * Setup monitoring workflows between components
     */
    setupMonitoringWorkflows() {
        // Error -> Analytics integration
        if (this.components.errorMonitor && this.components.analytics) {
            const originalHandleError = this.components.errorMonitor.handleError.bind(this.components.errorMonitor);
            this.components.errorMonitor.handleError = (errorData) => {
                // Call original error handler
                originalHandleError(errorData);
                
                // Also track in analytics
                this.components.analytics.trackError(errorData, {
                    component: 'error_monitor',
                    automated: true
                });
            };
        }
        
        // Performance -> Analytics integration
        this.setupPerformanceIntegration();
        
        // Business events -> Multiple systems integration
        this.setupBusinessEventIntegration();
    }
    
    /**
     * Setup performance monitoring integration
     */
    setupPerformanceIntegration() {
        // Monitor Core Web Vitals
        this.observePerformance();
        
        // Monitor API performance
        this.monitorAPIPerformance();
        
        // Monitor resource loading
        this.monitorResourceLoading();
    }
    
    /**
     * Setup business event integration
     */
    setupBusinessEventIntegration() {
        // Purchase flow monitoring
        window.addEventListener('purchase-flow-step', (event) => {
            this.trackPurchaseStep(event.detail);
        });
        
        // Wallet generation monitoring
        window.addEventListener('wallet-generated', (event) => {
            this.trackWalletGeneration(event.detail);
        });
        
        // Geolocation monitoring
        window.addEventListener('location-detected', (event) => {
            this.trackGeolocation(event.detail);
        });
        
        // API call monitoring
        window.addEventListener('api-call-completed', (event) => {
            this.trackAPICall(event.detail);
        });
    }
    
    /**
     * Setup health monitoring
     */
    setupHealthMonitoring() {
        // Monitor system health every 30 seconds
        setInterval(() => {
            this.checkSystemHealth();
        }, 30000);
        
        // Monitor for performance degradation
        this.monitorPerformanceDegradation();
        
        // Monitor for error spikes
        this.monitorErrorSpikes();
    }
    
    /**
     * Setup alert management
     */
    setupAlertManagement() {
        // Listen for alerts from error monitor
        if (this.components.errorMonitor) {
            const originalTriggerAlert = this.components.errorMonitor.triggerAlert.bind(this.components.errorMonitor);
            this.components.errorMonitor.triggerAlert = (alertType, data) => {
                // Call original alert handler
                originalTriggerAlert(alertType, data);
                
                // Process through monitoring integration
                this.processAlert({
                    type: alertType,
                    data,
                    source: 'error_monitor',
                    timestamp: Date.now()
                });
            };
        }
    }
    
    /**
     * Observe performance metrics
     */
    observePerformance() {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lcp = entries[entries.length - 1];
                    
                    this.trackPerformanceMetric('LCP', lcp.startTime);
                    
                    if (lcp.startTime > 4000) { // LCP threshold
                        this.triggerPerformanceAlert('slow_lcp', {
                            value: lcp.startTime,
                            threshold: 4000
                        });
                    }
                });
                
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (error) {
                console.warn('LCP observer not supported:', error);
            }
        }
        
        // First Input Delay
        try {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    this.trackPerformanceMetric('FID', entry.processingStart - entry.startTime);
                });
            });
            
            fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (error) {
            console.warn('FID observer not supported:', error);
        }
    }
    
    /**
     * Monitor API performance
     */
    monitorAPIPerformance() {
        // Intercept fetch requests for monitoring
        const originalFetch = window.fetch;
        
        window.fetch = async function(...args) {
            const startTime = performance.now();
            const url = args[0];
            
            try {
                const response = await originalFetch.apply(this, args);
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // Track API performance
                window.monitoringIntegration?.trackAPIPerformance({
                    url,
                    method: args[1]?.method || 'GET',
                    statusCode: response.status,
                    duration,
                    success: response.ok
                });
                
                return response;
            } catch (error) {
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // Track API error
                window.monitoringIntegration?.trackAPIPerformance({
                    url,
                    method: args[1]?.method || 'GET',
                    duration,
                    success: false,
                    error: error.message
                });
                
                throw error;
            }
        };
    }
    
    /**
     * Monitor resource loading performance
     */
    monitorResourceLoading() {
        if ('PerformanceObserver' in window) {
            try {
                const resourceObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    
                    entries.forEach((entry) => {
                        if (entry.duration > 2000) { // Slow resource threshold
                            this.triggerPerformanceAlert('slow_resource', {
                                url: entry.name,
                                duration: entry.duration,
                                type: entry.initiatorType
                            });
                        }
                        
                        this.trackResourceMetric(entry);
                    });
                });
                
                resourceObserver.observe({ entryTypes: ['resource'] });
            } catch (error) {
                console.warn('Resource observer not supported:', error);
            }
        }
    }
    
    /**
     * Check overall system health
     */
    checkSystemHealth() {
        const health = {
            timestamp: Date.now(),
            components: {},
            overall: 'healthy'
        };
        
        // Check each component health
        if (this.components.errorMonitor) {
            const errorSummary = this.components.errorMonitor.getErrorSummary();
            health.components.errors = {
                totalErrors: errorSummary.totalErrors,
                recentErrors: errorSummary.recentErrors,
                systemHealth: errorSummary.systemHealth
            };
            
            if (errorSummary.systemHealth?.status === 'critical') {
                health.overall = 'critical';
            } else if (errorSummary.systemHealth?.status === 'degraded' && health.overall === 'healthy') {
                health.overall = 'degraded';
            }
        }
        
        // Check performance metrics
        const performanceHealth = this.assessPerformanceHealth();
        health.components.performance = performanceHealth;
        
        if (performanceHealth.status === 'critical') {
            health.overall = 'critical';
        } else if (performanceHealth.status === 'degraded' && health.overall === 'healthy') {
            health.overall = 'degraded';
        }
        
        // Update health status
        this.healthStatus = health.overall;
        
        // Track health check
        this.trackEvent('health_check', health);
        
        return health;
    }
    
    /**
     * Assess performance health
     */
    assessPerformanceHealth() {
        const metrics = this.getPerformanceMetrics();
        let score = 100;
        let status = 'healthy';
        
        // Check memory usage
        if (metrics.memory?.used) {
            const memoryPercent = (metrics.memory.used / metrics.memory.limit) * 100;
            if (memoryPercent > 90) score -= 30;
            else if (memoryPercent > 70) score -= 15;
        }
        
        // Check LCP
        if (metrics.lcp > 4000) score -= 25;
        else if (metrics.lcp > 2500) score -= 10;
        
        // Check error rate
        if (metrics.errorRate > 5) score -= 20;
        else if (metrics.errorRate > 2) score -= 10;
        
        if (score < 50) status = 'critical';
        else if (score < 80) status = 'degraded';
        
        return { score, status, metrics };
    }
    
    /**
     * Monitor performance degradation
     */
    monitorPerformanceDegradation() {
        let performanceHistory = [];
        
        setInterval(() => {
            const currentPerformance = this.assessPerformanceHealth();
            performanceHistory.push({
                score: currentPerformance.score,
                timestamp: Date.now()
            });
            
            // Keep only last 10 readings
            if (performanceHistory.length > 10) {
                performanceHistory = performanceHistory.slice(-10);
            }
            
            // Check for consistent degradation
            if (performanceHistory.length >= 5) {
                const trend = this.calculateTrend(performanceHistory.map(h => h.score));
                
                if (trend < -5) { // Declining performance
                    this.processAlert({
                        type: 'performance_degradation',
                        data: {
                            trend,
                            currentScore: currentPerformance.score,
                            history: performanceHistory.slice(-5)
                        },
                        source: 'performance_monitor',
                        timestamp: Date.now()
                    });
                }
            }
        }, 60000); // Check every minute
    }
    
    /**
     * Monitor error spikes
     */
    monitorErrorSpikes() {
        let errorHistory = [];
        
        setInterval(() => {
            if (this.components.errorMonitor) {
                const errorSummary = this.components.errorMonitor.getErrorSummary();
                errorHistory.push({
                    count: errorSummary.recentErrors,
                    timestamp: Date.now()
                });
                
                // Keep only last 10 readings
                if (errorHistory.length > 10) {
                    errorHistory = errorHistory.slice(-10);
                }
                
                // Check for error spikes
                if (errorHistory.length >= 3) {
                    const recent = errorHistory.slice(-3);
                    const avgErrors = recent.reduce((sum, h) => sum + h.count, 0) / recent.length;
                    
                    if (avgErrors > 5) { // Error spike threshold
                        this.processAlert({
                            type: 'error_spike',
                            data: {
                                averageErrors: avgErrors,
                                recentHistory: recent
                            },
                            source: 'error_spike_monitor',
                            timestamp: Date.now()
                        });
                    }
                }
            }
        }, 30000); // Check every 30 seconds
    }
    
    /**
     * Process and manage alerts
     */
    processAlert(alert) {
        // Add alert to collection
        this.alerts.push(alert);
        
        // Keep only recent alerts (last 100)
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }
        
        // Track alert in analytics
        this.trackEvent('alert_triggered', {
            alertType: alert.type,
            source: alert.source,
            severity: this.getAlertSeverity(alert)
        });
        
        console.warn('MONITORING ALERT:', alert);
        
        // In production, integrate with external alerting
        this.sendExternalAlert(alert);
    }
    
    /**
     * Track business events
     */
    trackPurchaseStep(data) {
        this.trackEvent('purchase_step', data);
        
        // Monitor for purchase flow issues
        if (data.error) {
            this.processAlert({
                type: 'purchase_flow_error',
                data,
                source: 'business_monitor',
                timestamp: Date.now()
            });
        }
    }
    
    trackWalletGeneration(data) {
        this.trackEvent('wallet_generation', data);
    }
    
    trackGeolocation(data) {
        this.trackEvent('geolocation', data);
        
        // Monitor for geolocation issues
        if (!data.success) {
            this.processAlert({
                type: 'geolocation_failure',
                data,
                source: 'geolocation_monitor',
                timestamp: Date.now()
            });
        }
    }
    
    trackAPICall(data) {
        this.trackEvent('api_call', data);
        
        // Monitor for API issues
        if (!data.success || data.duration > 10000) {
            this.processAlert({
                type: 'api_performance_issue',
                data,
                source: 'api_monitor',
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * Helper methods
     */
    trackEvent(eventName, data) {
        if (this.components.analytics) {
            this.components.analytics.trackEvent(eventName, data);
        }
    }
    
    trackPerformanceMetric(name, value) {
        this.metrics.set(`${name}_${Date.now()}`, { name, value, timestamp: Date.now() });
        
        // Keep metrics limited
        if (this.metrics.size > 1000) {
            const oldestKey = this.metrics.keys().next().value;
            this.metrics.delete(oldestKey);
        }
    }
    
    trackAPIPerformance(data) {
        this.trackEvent('api_performance', data);
    }
    
    trackResourceMetric(entry) {
        this.trackEvent('resource_loaded', {
            url: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
            type: entry.initiatorType
        });
    }
    
    triggerPerformanceAlert(type, data) {
        this.processAlert({
            type,
            data,
            source: 'performance_monitor',
            timestamp: Date.now()
        });
    }
    
    getPerformanceMetrics() {
        const recentMetrics = Array.from(this.metrics.values()).slice(-50);
        
        return {
            lcp: recentMetrics.find(m => m.name === 'LCP')?.value || 0,
            memory: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null,
            errorRate: this.components.errorMonitor?.getErrorSummary()?.recentErrors || 0
        };
    }
    
    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        let sum = 0;
        for (let i = 1; i < values.length; i++) {
            sum += values[i] - values[i - 1];
        }
        
        return sum / (values.length - 1);
    }
    
    getAlertSeverity(alert) {
        const severityMap = {
            'performance_degradation': 'medium',
            'error_spike': 'high',
            'purchase_flow_error': 'high',
            'api_performance_issue': 'medium',
            'geolocation_failure': 'low'
        };
        
        return severityMap[alert.type] || 'medium';
    }
    
    sendExternalAlert(alert) {
        // In production, integrate with external alerting services
        // (Slack, PagerDuty, email, etc.)
        console.log('External alert would be sent:', alert);
    }
    
    shouldShowDashboard() {
        return new URLSearchParams(window.location.search).has('monitor') ||
               new URLSearchParams(window.location.search).has('debug');
    }
    
    sanitizeConfig() {
        // Remove sensitive information from config for logging
        const sanitized = { ...this.config };
        delete sanitized.SIMPLESWAP_API_KEY;
        delete sanitized.MERCURYO_WIDGET_ID;
        return sanitized;
    }
    
    /**
     * Public API
     */
    getMonitoringStatus() {
        return {
            healthStatus: this.healthStatus,
            components: Object.keys(this.components),
            activeAlerts: this.alerts.filter(a => !a.resolved),
            metrics: this.getPerformanceMetrics(),
            alertCount: this.alerts.length
        };
    }
    
    getHealthStatus() {
        return this.checkSystemHealth();
    }
    
    getAlerts() {
        return [...this.alerts];
    }
    
    clearAlerts() {
        this.alerts = [];
    }
    
    disable() {
        this.isEnabled = false;
        Object.values(this.components).forEach(component => {
            if (component.disable) component.disable();
        });
    }
    
    enable() {
        this.isEnabled = true;
        Object.values(this.components).forEach(component => {
            if (component.enable) component.enable();
        });
    }
}