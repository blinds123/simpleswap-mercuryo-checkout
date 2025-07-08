/**
 * Production Monitoring Dashboard
 * Real-time monitoring interface with metrics visualization
 */
class MonitoringDashboard {
    constructor(config = {}) {
        this.config = config;
        this.isEnabled = config.FEATURES?.ENABLE_PERFORMANCE_MONITORING || false;
        this.updateInterval = 5000; // 5 seconds
        this.metrics = {
            performance: {},
            errors: {},
            analytics: {},
            system: {}
        };
        
        this.charts = new Map();
        this.intervals = new Map();
        this.dashboardElement = null;
        
        this.initializeDashboard();
    }
    
    /**
     * Initialize monitoring dashboard
     */
    initializeDashboard() {
        if (!this.isEnabled) {
            console.log('Monitoring dashboard disabled by configuration');
            return;
        }
        
        // Only show dashboard in debug mode or with special query parameter
        const showDashboard = this.config.FEATURES?.DEBUG_MODE || 
                            new URLSearchParams(window.location.search).has('monitor');
        
        if (!showDashboard) {
            console.log('Monitoring dashboard hidden in production');
            return;
        }
        
        this.createDashboardUI();
        this.startMetricsCollection();
        
        console.log('Monitoring dashboard initialized');
    }
    
    /**
     * Create dashboard UI elements
     */
    createDashboardUI() {
        // Remove existing dashboard
        const existing = document.getElementById('monitoring-dashboard');
        if (existing) {
            existing.remove();
        }
        
        // Create dashboard container
        this.dashboardElement = document.createElement('div');
        this.dashboardElement.id = 'monitoring-dashboard';
        this.dashboardElement.innerHTML = this.getDashboardHTML();
        this.dashboardElement.style.cssText = this.getDashboardCSS();
        
        // Add to page
        document.body.appendChild(this.dashboardElement);
        
        // Setup event listeners
        this.setupDashboardEvents();
        
        // Initial render
        this.renderDashboard();
    }
    
    /**
     * Get dashboard HTML structure
     */
    getDashboardHTML() {
        return `
            <div class="dashboard-header">
                <h3>🔍 Monitoring Dashboard</h3>
                <div class="dashboard-controls">
                    <button id="dashboard-toggle" class="btn-minimize">−</button>
                    <button id="dashboard-close" class="btn-close">×</button>
                </div>
            </div>
            
            <div class="dashboard-content">
                <div class="metrics-grid">
                    <!-- System Health -->
                    <div class="metric-card">
                        <h4>System Health</h4>
                        <div class="health-indicator">
                            <div id="health-score" class="health-score">--</div>
                            <div id="health-status" class="health-status">--</div>
                        </div>
                    </div>
                    
                    <!-- Performance Metrics -->
                    <div class="metric-card">
                        <h4>Performance</h4>
                        <div class="metric-row">
                            <span>Load Time:</span>
                            <span id="load-time">--</span>
                        </div>
                        <div class="metric-row">
                            <span>Memory:</span>
                            <span id="memory-usage">--</span>
                        </div>
                        <div class="metric-row">
                            <span>API Calls:</span>
                            <span id="api-calls">--</span>
                        </div>
                    </div>
                    
                    <!-- Error Metrics -->
                    <div class="metric-card">
                        <h4>Errors</h4>
                        <div class="metric-row">
                            <span>Total:</span>
                            <span id="total-errors">--</span>
                        </div>
                        <div class="metric-row">
                            <span>Recent:</span>
                            <span id="recent-errors">--</span>
                        </div>
                        <div class="metric-row">
                            <span>Critical:</span>
                            <span id="critical-errors">--</span>
                        </div>
                    </div>
                    
                    <!-- User Analytics -->
                    <div class="metric-card">
                        <h4>Analytics</h4>
                        <div class="metric-row">
                            <span>Session:</span>
                            <span id="session-duration">--</span>
                        </div>
                        <div class="metric-row">
                            <span>Events:</span>
                            <span id="event-count">--</span>
                        </div>
                        <div class="metric-row">
                            <span>Interactions:</span>
                            <span id="interaction-count">--</span>
                        </div>
                    </div>
                </div>
                
                <!-- Real-time Charts -->
                <div class="charts-section">
                    <div class="chart-container">
                        <h4>Performance Timeline</h4>
                        <canvas id="performance-chart" width="300" height="100"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h4>Error Rate</h4>
                        <canvas id="error-chart" width="300" height="100"></canvas>
                    </div>
                </div>
                
                <!-- Recent Events Log -->
                <div class="events-section">
                    <h4>Recent Events</h4>
                    <div id="events-log" class="events-log"></div>
                </div>
                
                <!-- System Information -->
                <div class="system-info">
                    <h4>System Info</h4>
                    <div class="info-grid">
                        <div>Browser: <span id="browser-info">--</span></div>
                        <div>Connection: <span id="connection-info">--</span></div>
                        <div>Viewport: <span id="viewport-info">--</span></div>
                        <div>Session ID: <span id="session-id">--</span></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Get dashboard CSS styles
     */
    getDashboardCSS() {
        return `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            background: rgba(0, 0, 0, 0.95);
            color: #fff;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
    }
    
    /**
     * Setup dashboard event listeners
     */
    setupDashboardEvents() {
        // Toggle minimize/maximize
        const toggleBtn = document.getElementById('dashboard-toggle');
        toggleBtn?.addEventListener('click', () => {
            const content = this.dashboardElement.querySelector('.dashboard-content');
            const isMinimized = content.style.display === 'none';
            
            content.style.display = isMinimized ? 'block' : 'none';
            toggleBtn.textContent = isMinimized ? '−' : '+';
        });
        
        // Close dashboard
        const closeBtn = document.getElementById('dashboard-close');
        closeBtn?.addEventListener('click', () => {
            this.destroy();
        });
        
        // Make draggable
        this.makeDraggable();
    }
    
    /**
     * Make dashboard draggable
     */
    makeDraggable() {
        const header = this.dashboardElement.querySelector('.dashboard-header');
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(getComputedStyle(this.dashboardElement).left);
            startTop = parseInt(getComputedStyle(this.dashboardElement).top);
            
            header.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const newLeft = startLeft + (e.clientX - startX);
            const newTop = startTop + (e.clientY - startY);
            
            this.dashboardElement.style.left = newLeft + 'px';
            this.dashboardElement.style.top = newTop + 'px';
            this.dashboardElement.style.right = 'auto';
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            header.style.cursor = 'grab';
        });
    }
    
    /**
     * Start metrics collection
     */
    startMetricsCollection() {
        // Collect metrics periodically
        this.intervals.set('metrics', setInterval(() => {
            this.collectMetrics();
            this.renderDashboard();
        }, this.updateInterval));
        
        // Update charts less frequently
        this.intervals.set('charts', setInterval(() => {
            this.updateCharts();
        }, this.updateInterval * 2));
        
        // Log recent events
        this.intervals.set('events', setInterval(() => {
            this.updateEventsLog();
        }, this.updateInterval));
    }
    
    /**
     * Collect metrics from various sources
     */
    collectMetrics() {
        // Performance metrics
        if ('performance' in window) {
            this.metrics.performance = {
                loadTime: performance.timing?.loadEventEnd - performance.timing?.navigationStart || 0,
                domContentLoaded: performance.timing?.domContentLoadedEventEnd - performance.timing?.navigationStart || 0,
                memory: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                } : null
            };
        }
        
        // Error metrics (from global error monitor)
        if (window.errorMonitor) {
            this.metrics.errors = window.errorMonitor.getErrorSummary();
        }
        
        // Analytics metrics (from global analytics)
        if (window.analyticsManager) {
            this.metrics.analytics = window.analyticsManager.getAnalyticsSummary();
        }
        
        // System metrics
        this.metrics.system = {
            userAgent: navigator.userAgent,
            connection: this.getConnectionInfo(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            sessionDuration: Date.now() - (window.sessionStartTime || Date.now())
        };
    }
    
    /**
     * Render dashboard with current metrics
     */
    renderDashboard() {
        try {
            // System Health
            const healthScore = this.calculateHealthScore();
            this.updateElement('health-score', healthScore.score + '%');
            this.updateElement('health-status', healthScore.status);
            this.updateHealthIndicator(healthScore);
            
            // Performance Metrics
            this.updateElement('load-time', this.formatTime(this.metrics.performance.loadTime));
            this.updateElement('memory-usage', this.formatMemory(this.metrics.performance.memory?.used));
            this.updateElement('api-calls', this.getApiCallCount());
            
            // Error Metrics
            this.updateElement('total-errors', this.metrics.errors.totalErrors || 0);
            this.updateElement('recent-errors', this.metrics.errors.recentErrors || 0);
            this.updateElement('critical-errors', this.getCriticalErrorCount());
            
            // Analytics
            this.updateElement('session-duration', this.formatTime(this.metrics.system.sessionDuration));
            this.updateElement('event-count', this.metrics.analytics.eventCount || 0);
            this.updateElement('interaction-count', this.getInteractionCount());
            
            // System Info
            this.updateElement('browser-info', this.getBrowserInfo());
            this.updateElement('connection-info', this.getConnectionDisplay());
            this.updateElement('viewport-info', `${this.metrics.system.viewport.width}×${this.metrics.system.viewport.height}`);
            this.updateElement('session-id', this.metrics.analytics.sessionId?.substring(0, 12) || 'N/A');
            
        } catch (error) {
            console.error('Error rendering dashboard:', error);
        }
    }
    
    /**
     * Update dashboard element
     */
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    /**
     * Calculate overall system health score
     */
    calculateHealthScore() {
        let score = 100;
        let status = 'healthy';
        
        // Deduct for errors
        const recentErrors = this.metrics.errors.recentErrors || 0;
        score -= Math.min(recentErrors * 5, 30);
        
        // Deduct for performance issues
        const memoryUsage = this.metrics.performance.memory?.used || 0;
        const memoryLimit = this.metrics.performance.memory?.limit || 1;
        const memoryPercent = (memoryUsage / memoryLimit) * 100;
        
        if (memoryPercent > 80) score -= 20;
        else if (memoryPercent > 60) score -= 10;
        
        // Deduct for load time
        const loadTime = this.metrics.performance.loadTime || 0;
        if (loadTime > 5000) score -= 15;
        else if (loadTime > 3000) score -= 10;
        
        // Determine status
        if (score >= 80) status = 'healthy';
        else if (score >= 60) status = 'degraded';
        else status = 'critical';
        
        return { score: Math.max(score, 0), status };
    }
    
    /**
     * Update health indicator styling
     */
    updateHealthIndicator(health) {
        const scoreElement = document.getElementById('health-score');
        const statusElement = document.getElementById('health-status');
        
        if (scoreElement && statusElement) {
            // Color coding based on health
            let color = '#10b981'; // green
            if (health.status === 'degraded') color = '#f59e0b'; // yellow
            if (health.status === 'critical') color = '#ef4444'; // red
            
            scoreElement.style.color = color;
            statusElement.style.color = color;
            statusElement.textContent = health.status.toUpperCase();
        }
    }
    
    /**
     * Update real-time charts
     */
    updateCharts() {
        // Simple chart implementation (in production, use Chart.js or similar)
        this.updatePerformanceChart();
        this.updateErrorChart();
    }
    
    /**
     * Update performance chart
     */
    updatePerformanceChart() {
        const canvas = document.getElementById('performance-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw performance line (mock data)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const points = 20;
        for (let i = 0; i < points; i++) {
            const x = (width / points) * i;
            const y = height - (Math.random() * height * 0.6 + height * 0.2);
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }
    
    /**
     * Update error chart
     */
    updateErrorChart() {
        const canvas = document.getElementById('error-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw error bars (mock data)
        ctx.fillStyle = '#ef4444';
        
        const bars = 10;
        const barWidth = width / bars;
        
        for (let i = 0; i < bars; i++) {
            const x = i * barWidth;
            const barHeight = Math.random() * height * 0.4;
            const y = height - barHeight;
            
            ctx.fillRect(x, y, barWidth * 0.8, barHeight);
        }
    }
    
    /**
     * Update events log
     */
    updateEventsLog() {
        const logElement = document.getElementById('events-log');
        if (!logElement) return;
        
        // Get recent events from analytics
        const recentEvents = this.getRecentEvents();
        
        logElement.innerHTML = recentEvents
            .slice(-5) // Last 5 events
            .map(event => `
                <div class="event-entry">
                    <span class="event-time">${new Date(event.timestamp).toLocaleTimeString()}</span>
                    <span class="event-type">${event.type}</span>
                    <span class="event-details">${event.details}</span>
                </div>
            `).join('');
    }
    
    /**
     * Helper methods for metrics formatting
     */
    formatTime(ms) {
        if (!ms || ms === 0) return '--';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    }
    
    formatMemory(bytes) {
        if (!bytes) return '--';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)}MB`;
    }
    
    getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }
    
    getConnectionInfo() {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType || 'unknown';
        }
        return 'unknown';
    }
    
    getConnectionDisplay() {
        const info = this.getConnectionInfo();
        if (info === 'unknown') return '--';
        return info.toUpperCase();
    }
    
    getApiCallCount() {
        // Would integrate with API manager
        return window.apiManager?.getCacheStats()?.size || 0;
    }
    
    getCriticalErrorCount() {
        return this.metrics.errors.systemHealth?.criticalErrors || 0;
    }
    
    getInteractionCount() {
        // Would get from analytics manager
        return Math.floor(this.metrics.system.sessionDuration / 10000); // Mock calculation
    }
    
    getRecentEvents() {
        // Mock recent events - in production, get from analytics
        return [
            { timestamp: Date.now() - 5000, type: 'click', details: 'Buy button clicked' },
            { timestamp: Date.now() - 10000, type: 'api', details: 'Geolocation API called' },
            { timestamp: Date.now() - 15000, type: 'load', details: 'Page loaded' }
        ];
    }
    
    /**
     * Destroy dashboard and cleanup
     */
    destroy() {
        // Clear intervals
        this.intervals.forEach((interval) => {
            clearInterval(interval);
        });
        this.intervals.clear();
        
        // Remove DOM element
        if (this.dashboardElement && this.dashboardElement.parentNode) {
            this.dashboardElement.parentNode.removeChild(this.dashboardElement);
        }
        
        console.log('Monitoring dashboard destroyed');
    }
    
    /**
     * Public API methods
     */
    show() {
        if (this.dashboardElement) {
            this.dashboardElement.style.display = 'block';
        }
    }
    
    hide() {
        if (this.dashboardElement) {
            this.dashboardElement.style.display = 'none';
        }
    }
    
    toggle() {
        if (this.dashboardElement) {
            const isVisible = this.dashboardElement.style.display !== 'none';
            this.dashboardElement.style.display = isVisible ? 'none' : 'block';
        }
    }
}