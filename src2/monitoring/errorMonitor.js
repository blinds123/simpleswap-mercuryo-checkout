/**
 * Production Error Monitoring and Reporting
 * Comprehensive error tracking, reporting, and alerting system
 */
class ErrorMonitor {
    constructor(config = {}) {
        this.config = config;
        this.isEnabled = config.FEATURES?.ENABLE_SECURITY_LOGGING || false;
        this.errors = [];
        this.maxErrors = 500;
        this.reportingEndpoint = '/api/errors/report';
        this.alertThresholds = {
            errorRate: 10, // errors per minute
            criticalErrors: 3, // critical errors per minute
            memoryLeaks: 5, // consecutive memory increases
            apiFailures: 5 // consecutive API failures
        };
        
        this.errorCounts = {
            total: 0,
            byType: new Map(),
            byComponent: new Map(),
            recentMinute: []
        };
        
        this.initializeErrorMonitoring();
    }
    
    /**
     * Initialize comprehensive error monitoring
     */
    initializeErrorMonitoring() {
        if (!this.isEnabled) {
            console.log('Error monitoring disabled by configuration');
            return;
        }
        
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                stack: event.error?.stack,
                timestamp: Date.now(),
                severity: 'error'
            });
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'unhandled_promise_rejection',
                message: event.reason?.message || 'Unhandled promise rejection',
                reason: event.reason,
                stack: event.reason?.stack,
                timestamp: Date.now(),
                severity: 'warning'
            });
        });
        
        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError({
                    type: 'resource_load_error',
                    message: `Failed to load resource: ${event.target.src || event.target.href}`,
                    resourceType: event.target.tagName,
                    resourceUrl: event.target.src || event.target.href,
                    timestamp: Date.now(),
                    severity: 'warning'
                });
            }
        }, true);
        
        // Performance monitoring for memory leaks
        this.monitorPerformanceErrors();
        
        // Setup periodic error rate monitoring
        this.setupErrorRateMonitoring();
        
        console.log('Error monitoring initialized');
    }
    
    /**
     * Handle and process errors
     */
    handleError(errorData) {
        try {
            // Enhance error data
            const enhancedError = this.enhanceErrorData(errorData);
            
            // Add to error collection
            this.errors.push(enhancedError);
            
            // Update error statistics
            this.updateErrorStatistics(enhancedError);
            
            // Check alert thresholds
            this.checkAlertThresholds(enhancedError);
            
            // Trim error collection if too large
            if (this.errors.length > this.maxErrors) {
                this.errors = this.errors.slice(-this.maxErrors);
            }
            
            // Report critical errors immediately
            if (enhancedError.severity === 'critical') {
                this.reportError(enhancedError, true);
            }
            
            // Log to console in development
            if (this.config.FEATURES?.DEBUG_MODE) {
                console.error('Error monitored:', enhancedError);
            }
            
        } catch (monitoringError) {
            // Prevent infinite loops in error monitoring
            console.error('Error in error monitoring:', monitoringError);
        }
    }
    
    /**
     * Enhance error data with additional context
     */
    enhanceErrorData(errorData) {
        return {
            ...errorData,
            id: this.generateErrorId(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            referrer: document.referrer,
            viewportSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screenSize: {
                width: screen.width,
                height: screen.height
            },
            memory: this.getMemoryInfo(),
            connectionType: this.getConnectionType(),
            batteryStatus: this.getBatteryStatus(),
            sessionInfo: this.getSessionInfo(),
            breadcrumbs: this.getRecentBreadcrumbs()
        };
    }
    
    /**
     * Update error statistics
     */
    updateErrorStatistics(error) {
        // Update total count
        this.errorCounts.total++;
        
        // Update by type
        const count = this.errorCounts.byType.get(error.type) || 0;
        this.errorCounts.byType.set(error.type, count + 1);
        
        // Update by component (if available)
        if (error.component) {
            const componentCount = this.errorCounts.byComponent.get(error.component) || 0;
            this.errorCounts.byComponent.set(error.component, componentCount + 1);
        }
        
        // Track recent errors for rate monitoring
        this.errorCounts.recentMinute.push({
            timestamp: error.timestamp,
            severity: error.severity,
            type: error.type
        });
        
        // Clean old entries (older than 1 minute)
        const oneMinuteAgo = Date.now() - 60000;
        this.errorCounts.recentMinute = this.errorCounts.recentMinute.filter(
            entry => entry.timestamp > oneMinuteAgo
        );
    }
    
    /**
     * Check alert thresholds and trigger alerts
     */
    checkAlertThresholds(error) {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Check error rate
        const recentErrors = this.errorCounts.recentMinute.length;
        if (recentErrors >= this.alertThresholds.errorRate) {
            this.triggerAlert('high_error_rate', {
                errorRate: recentErrors,
                threshold: this.alertThresholds.errorRate,
                timeWindow: '1 minute'
            });
        }
        
        // Check critical errors
        const criticalErrors = this.errorCounts.recentMinute.filter(
            entry => entry.severity === 'critical'
        ).length;
        
        if (criticalErrors >= this.alertThresholds.criticalErrors) {
            this.triggerAlert('critical_error_threshold', {
                criticalErrors,
                threshold: this.alertThresholds.criticalErrors,
                timeWindow: '1 minute'
            });
        }
        
        // Check API failure patterns
        const apiErrors = this.errorCounts.recentMinute.filter(
            entry => entry.type.includes('api') || entry.type.includes('network')
        ).length;
        
        if (apiErrors >= this.alertThresholds.apiFailures) {
            this.triggerAlert('api_failure_pattern', {
                apiErrors,
                threshold: this.alertThresholds.apiFailures,
                timeWindow: '1 minute'
            });
        }
    }
    
    /**
     * Trigger error alert
     */
    triggerAlert(alertType, data) {
        const alert = {
            id: this.generateAlertId(),
            type: alertType,
            severity: 'high',
            data,
            timestamp: Date.now(),
            resolved: false
        };
        
        console.warn('ERROR ALERT TRIGGERED:', alert);
        
        // Report alert immediately
        this.reportAlert(alert);
        
        // In production, would integrate with alerting services
        // (Slack, PagerDuty, email, etc.)
    }
    
    /**
     * Monitor performance-related errors
     */
    monitorPerformanceErrors() {
        let memoryReadings = [];
        
        setInterval(() => {
            if ('memory' in performance) {
                const memory = performance.memory;
                const memoryUsage = memory.usedJSHeapSize;
                
                memoryReadings.push({
                    usage: memoryUsage,
                    timestamp: Date.now()
                });
                
                // Keep only last 10 readings
                if (memoryReadings.length > 10) {
                    memoryReadings = memoryReadings.slice(-10);
                }
                
                // Check for memory leaks (consecutive increases)
                if (memoryReadings.length >= this.alertThresholds.memoryLeaks) {
                    const isIncreasing = memoryReadings.slice(-this.alertThresholds.memoryLeaks)
                        .every((reading, index, arr) => {
                            return index === 0 || reading.usage > arr[index - 1].usage;
                        });
                    
                    if (isIncreasing) {
                        this.handleError({
                            type: 'memory_leak_detected',
                            message: 'Potential memory leak detected',
                            memoryUsage: memoryUsage,
                            memoryReadings: memoryReadings.slice(-5),
                            severity: 'warning',
                            timestamp: Date.now()
                        });
                    }
                }
            }
        }, 30000); // Check every 30 seconds
    }
    
    /**
     * Setup error rate monitoring
     */
    setupErrorRateMonitoring() {
        setInterval(() => {
            const errorRate = this.errorCounts.recentMinute.length;
            
            if (errorRate > 0) {
                console.log(`Current error rate: ${errorRate} errors/minute`);
            }
            
            // Generate error rate report
            this.generateErrorRateReport();
            
        }, 60000); // Every minute
    }
    
    /**
     * Generate error rate report
     */
    generateErrorRateReport() {
        const report = {
            timestamp: Date.now(),
            errorRate: this.errorCounts.recentMinute.length,
            totalErrors: this.errorCounts.total,
            errorsByType: Object.fromEntries(this.errorCounts.byType),
            errorsByComponent: Object.fromEntries(this.errorCounts.byComponent),
            topErrors: this.getTopErrors(),
            systemHealth: this.getSystemHealth()
        };
        
        // Store report for dashboard
        this.lastErrorReport = report;
        
        return report;
    }
    
    /**
     * Get top errors by frequency
     */
    getTopErrors() {
        const errorFrequency = new Map();
        
        this.errors.forEach(error => {
            const key = `${error.type}:${error.message}`;
            const count = errorFrequency.get(key) || 0;
            errorFrequency.set(key, count + 1);
        });
        
        return Array.from(errorFrequency.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([error, count]) => ({ error, count }));
    }
    
    /**
     * Get system health metrics
     */
    getSystemHealth() {
        const now = Date.now();
        const fiveMinutesAgo = now - 300000;
        
        const recentErrors = this.errors.filter(
            error => error.timestamp > fiveMinutesAgo
        );
        
        const criticalErrors = recentErrors.filter(
            error => error.severity === 'critical'
        ).length;
        
        const apiErrors = recentErrors.filter(
            error => error.type.includes('api') || error.type.includes('network')
        ).length;
        
        let healthScore = 100;
        healthScore -= Math.min(recentErrors.length * 2, 50); // -2 per error, max -50
        healthScore -= criticalErrors * 10; // -10 per critical error
        healthScore -= apiErrors * 3; // -3 per API error
        
        return {
            score: Math.max(healthScore, 0),
            status: healthScore > 80 ? 'healthy' : healthScore > 50 ? 'degraded' : 'critical',
            recentErrors: recentErrors.length,
            criticalErrors,
            apiErrors
        };
    }
    
    /**
     * Report error to backend
     */
    async reportError(error, immediate = false) {
        if (!this.isEnabled) return;
        
        const payload = {
            errors: [error],
            metadata: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: Date.now(),
                immediate
            }
        };
        
        try {
            if (immediate && navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(payload)], {
                    type: 'application/json'
                });
                navigator.sendBeacon(this.reportingEndpoint, blob);
            } else {
                await fetch(this.reportingEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
        } catch (reportingError) {
            console.error('Failed to report error:', reportingError);
        }
    }
    
    /**
     * Report alert to monitoring service
     */
    async reportAlert(alert) {
        // In production, integrate with monitoring services
        console.warn('ALERT REPORTED:', alert);
        
        try {
            await fetch('/api/alerts/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alert)
            });
        } catch (error) {
            console.error('Failed to report alert:', error);
        }
    }
    
    /**
     * Utility functions for error context
     */
    getMemoryInfo() {
        if ('memory' in performance) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }
    
    getConnectionType() {
        if ('connection' in navigator) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            };
        }
        return null;
    }
    
    getBatteryStatus() {
        // Note: Battery API is deprecated but included for completeness
        return null;
    }
    
    getSessionInfo() {
        return {
            sessionDuration: Date.now() - (window.sessionStartTime || Date.now()),
            pageLoadTime: performance.timing?.loadEventEnd - performance.timing?.navigationStart
        };
    }
    
    getRecentBreadcrumbs() {
        // Return recent user actions for debugging context
        return window.userBreadcrumbs?.slice(-5) || [];
    }
    
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    
    /**
     * Public API methods
     */
    getErrorSummary() {
        return {
            totalErrors: this.errorCounts.total,
            recentErrors: this.errorCounts.recentMinute.length,
            errorsByType: Object.fromEntries(this.errorCounts.byType),
            systemHealth: this.getSystemHealth(),
            lastReport: this.lastErrorReport
        };
    }
    
    clearErrors() {
        this.errors = [];
        this.errorCounts.total = 0;
        this.errorCounts.byType.clear();
        this.errorCounts.byComponent.clear();
        this.errorCounts.recentMinute = [];
    }
    
    setAlertThresholds(thresholds) {
        this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    }
}