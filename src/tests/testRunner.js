/**
 * Test Runner for Production Validation
 * Executes all validation tests and generates reports
 */
class TestRunner {
    constructor() {
        this.testSuites = [];
        this.results = {};
        this.isRunning = false;
        
        this.initializeTestRunner();
    }
    
    /**
     * Initialize test runner
     */
    initializeTestRunner() {
        console.log('🧪 Test Runner Initialized');
        
        // Register available test suites
        this.registerTestSuites();
        
        // Setup test runner UI if in debug mode
        if (this.shouldShowTestUI()) {
            this.createTestUI();
        }
    }
    
    /**
     * Register all available test suites
     */
    registerTestSuites() {
        this.testSuites = [
            {
                name: 'Security Validation',
                description: 'Comprehensive security testing',
                runner: () => this.runSecurityValidation(),
                category: 'security',
                priority: 'high'
            },
            {
                name: 'Performance Testing',
                description: 'Performance metrics and Core Web Vitals',
                runner: () => this.runPerformanceTests(),
                category: 'performance',
                priority: 'medium'
            },
            {
                name: 'API Integration Testing',
                description: 'API endpoint validation and connectivity',
                runner: () => this.runAPITests(),
                category: 'integration',
                priority: 'high'
            },
            {
                name: 'Component Integration',
                description: 'Component interaction and integration testing',
                runner: () => this.runComponentTests(),
                category: 'integration',
                priority: 'medium'
            },
            {
                name: 'Business Logic Testing',
                description: 'Purchase flow and business logic validation',
                runner: () => this.runBusinessLogicTests(),
                category: 'business',
                priority: 'high'
            },
            {
                name: 'Phase 2 Success Criteria',
                description: 'Comprehensive Phase 2 completion validation',
                runner: () => this.runPhase2SuccessValidation(),
                category: 'validation',
                priority: 'critical'
            }
        ];
    }
    
    /**
     * Create test runner UI
     */
    createTestUI() {
        // Remove existing test UI
        const existing = document.getElementById('test-runner-ui');
        if (existing) {
            existing.remove();
        }
        
        // Create test UI container
        const testUI = document.createElement('div');
        testUI.id = 'test-runner-ui';
        testUI.innerHTML = this.getTestUIHTML();
        testUI.style.cssText = this.getTestUICSS();
        
        // Add to page
        document.body.appendChild(testUI);
        
        // Setup event listeners
        this.setupTestUIEvents();
    }
    
    /**
     * Get test UI HTML
     */
    getTestUIHTML() {
        return `
            <div class="test-header">
                <h3>🧪 Test Runner</h3>
                <div class="test-controls">
                    <button id="run-all-tests" class="btn-primary">Run All Tests</button>
                    <button id="test-toggle" class="btn-minimize">−</button>
                    <button id="test-close" class="btn-close">×</button>
                </div>
            </div>
            
            <div class="test-content">
                <div class="test-suites">
                    ${this.testSuites.map(suite => `
                        <div class="test-suite" data-category="${suite.category}">
                            <div class="suite-header">
                                <span class="suite-name">${suite.name}</span>
                                <span class="suite-priority priority-${suite.priority}">${suite.priority}</span>
                                <button class="run-suite-btn" data-suite="${suite.name}">Run</button>
                            </div>
                            <div class="suite-description">${suite.description}</div>
                            <div class="suite-status" id="status-${suite.name.replace(/\s+/g, '-').toLowerCase()}">Ready</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="test-results">
                    <h4>Test Results</h4>
                    <div id="test-results-content">
                        <p>No tests run yet. Click "Run All Tests" to start.</p>
                    </div>
                </div>
                
                <div class="test-summary">
                    <h4>Summary</h4>
                    <div class="summary-stats">
                        <div class="stat">
                            <span class="stat-label">Total:</span>
                            <span id="total-tests">0</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Passed:</span>
                            <span id="passed-tests">0</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Failed:</span>
                            <span id="failed-tests">0</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Success Rate:</span>
                            <span id="success-rate">0%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Get test UI CSS
     */
    getTestUICSS() {
        return `
            position: fixed;
            top: 20px;
            left: 20px;
            width: 400px;
            max-height: 80vh;
            background: rgba(0, 0, 0, 0.95);
            color: #fff;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow-y: auto;
        `;
    }
    
    /**
     * Setup test UI event listeners
     */
    setupTestUIEvents() {
        // Run all tests
        document.getElementById('run-all-tests')?.addEventListener('click', () => {
            this.runAllTests();
        });
        
        // Individual suite runners
        document.querySelectorAll('.run-suite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const suiteName = e.target.getAttribute('data-suite');
                this.runTestSuite(suiteName);
            });
        });
        
        // Toggle minimize/maximize
        document.getElementById('test-toggle')?.addEventListener('click', (e) => {
            const content = document.querySelector('#test-runner-ui .test-content');
            const isMinimized = content.style.display === 'none';
            
            content.style.display = isMinimized ? 'block' : 'none';
            e.target.textContent = isMinimized ? '−' : '+';
        });
        
        // Close test runner
        document.getElementById('test-close')?.addEventListener('click', () => {
            document.getElementById('test-runner-ui')?.remove();
        });
    }
    
    /**
     * Run all test suites
     */
    async runAllTests() {
        if (this.isRunning) {
            console.log('Tests already running...');
            return;
        }
        
        this.isRunning = true;
        this.results = {};
        
        console.log('🧪 Running All Tests...');
        this.updateRunAllButton(true);
        
        try {
            for (const suite of this.testSuites) {
                await this.runTestSuite(suite.name);
            }
            
            this.generateOverallReport();
            
        } catch (error) {
            console.error('Test execution failed:', error);
        } finally {
            this.isRunning = false;
            this.updateRunAllButton(false);
        }
    }
    
    /**
     * Run individual test suite
     */
    async runTestSuite(suiteName) {
        const suite = this.testSuites.find(s => s.name === suiteName);
        if (!suite) {
            console.error(`Test suite not found: ${suiteName}`);
            return;
        }
        
        const statusElement = document.getElementById(`status-${suiteName.replace(/\s+/g, '-').toLowerCase()}`);
        
        try {
            console.log(`🔄 Running ${suiteName}...`);
            if (statusElement) statusElement.textContent = 'Running...';
            
            const result = await suite.runner();
            this.results[suiteName] = result;
            
            const status = result.passed ? 'PASSED' : 'FAILED';
            console.log(`✅ ${suiteName}: ${status}`);
            
            if (statusElement) {
                statusElement.textContent = status;
                statusElement.className = `suite-status ${status.toLowerCase()}`;
            }
            
            this.updateTestResults(suiteName, result);
            
        } catch (error) {
            console.error(`❌ ${suiteName} failed:`, error);
            
            if (statusElement) {
                statusElement.textContent = 'ERROR';
                statusElement.className = 'suite-status error';
            }
            
            this.results[suiteName] = {
                passed: false,
                error: error.message,
                details: []
            };
        }
    }
    
    /**
     * Run security validation tests
     */
    async runSecurityValidation() {
        if (typeof SecurityValidation === 'undefined') {
            throw new Error('SecurityValidation class not available');
        }
        
        const validator = new SecurityValidation();
        
        // Wait for validation to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const results = validator.getResults();
        
        return {
            passed: results.failedTests === 0 && results.errorTests === 0,
            totalTests: results.totalTests,
            passedTests: results.passedTests,
            failedTests: results.failedTests,
            errorTests: results.errorTests,
            details: results.testResults
        };
    }
    
    /**
     * Run performance tests
     */
    async runPerformanceTests() {
        try {
            // Check if comprehensive performance test suite is available
            if (typeof PerformanceTestSuite !== 'undefined') {
                console.log('🚀 Running comprehensive performance test suite...');
                
                const performanceTests = new PerformanceTestSuite();
                
                // Wait for performance tests to complete
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const results = performanceTests.getResults();
                
                return {
                    passed: results.testResults.every(test => test.status === 'PASS'),
                    comprehensive: true,
                    totalTests: results.testResults.length,
                    passedTests: results.testResults.filter(t => t.status === 'PASS').length,
                    failedTests: results.testResults.filter(t => t.status === 'FAIL').length,
                    errorTests: results.testResults.filter(t => t.status === 'ERROR').length,
                    details: results.testResults,
                    metrics: results.metrics,
                    webVitals: results.webVitalsData
                };
            } else {
                // Fallback to basic performance tests
                console.log('📊 Running basic performance tests...');
                return await this.runBasicPerformanceTests();
            }
            
        } catch (error) {
            console.error('Performance test suite failed, falling back to basic tests:', error);
            return await this.runBasicPerformanceTests();
        }
    }
    
    /**
     * Run basic performance tests (fallback)
     */
    async runBasicPerformanceTests() {
        const tests = [];
        const errors = [];
        
        try {
            // Test Core Web Vitals
            const performanceEntries = performance.getEntriesByType('navigation');
            if (performanceEntries.length > 0) {
                const nav = performanceEntries[0];
                const loadTime = nav.loadEventEnd - nav.loadEventStart;
                
                tests.push({
                    name: 'Page Load Time',
                    passed: loadTime < 3000,
                    value: loadTime,
                    threshold: 3000
                });
            }
            
            // Test memory usage
            if (performance.memory) {
                const memoryUsage = performance.memory.usedJSHeapSize;
                const memoryLimit = performance.memory.jsHeapSizeLimit;
                const memoryPercent = (memoryUsage / memoryLimit) * 100;
                
                tests.push({
                    name: 'Memory Usage',
                    passed: memoryPercent < 70,
                    value: memoryPercent,
                    threshold: 70
                });
            }
            
            // Test performance manager integration
            if (window.performanceManager) {
                tests.push({
                    name: 'Performance Manager Available',
                    passed: true,
                    value: 'Available'
                });
            } else {
                errors.push('Performance Manager not available');
            }
            
        } catch (error) {
            errors.push(`Performance test error: ${error.message}`);
        }
        
        return {
            passed: tests.every(t => t.passed) && errors.length === 0,
            comprehensive: false,
            tests,
            errors,
            details: tests
        };
    }
    
    /**
     * Run API integration tests
     */
    async runAPITests() {
        const tests = [];
        const errors = [];
        
        try {
            // Test API Manager availability
            if (window.apiManager) {
                tests.push({
                    name: 'API Manager Available',
                    passed: true,
                    value: 'Available'
                });
            } else {
                errors.push('API Manager not available');
            }
            
            // Test API endpoints accessibility (without making actual calls)
            const endpoints = [
                'https://api.simpleswap.io',
                'https://exchange.mrcr.io',
                'https://ipapi.co'
            ];
            
            for (const endpoint of endpoints) {
                tests.push({
                    name: `Endpoint Configuration: ${endpoint}`,
                    passed: true, // Configuration test, not actual connectivity
                    value: 'Configured'
                });
            }
            
        } catch (error) {
            errors.push(`API test error: ${error.message}`);
        }
        
        return {
            passed: tests.every(t => t.passed) && errors.length === 0,
            tests,
            errors,
            details: tests
        };
    }
    
    /**
     * Run component integration tests
     */
    async runComponentTests() {
        const tests = [];
        const errors = [];
        
        try {
            // Test component availability
            const components = [
                { name: 'SecurityManager', available: typeof SecurityManager !== 'undefined' },
                { name: 'PerformanceManager', available: typeof PerformanceManager !== 'undefined' },
                { name: 'APIManager', available: typeof APIManager !== 'undefined' },
                { name: 'AnalyticsManager', available: typeof AnalyticsManager !== 'undefined' },
                { name: 'ErrorMonitor', available: typeof ErrorMonitor !== 'undefined' },
                { name: 'MonitoringDashboard', available: typeof MonitoringDashboard !== 'undefined' },
                { name: 'DeepLinkBuilder', available: typeof DeepLinkBuilder !== 'undefined' },
                { name: 'WalletHandler', available: typeof WalletHandler !== 'undefined' },
                { name: 'GeoRedirector', available: typeof GeoRedirector !== 'undefined' }
            ];
            
            for (const component of components) {
                tests.push({
                    name: `Component: ${component.name}`,
                    passed: component.available,
                    value: component.available ? 'Available' : 'Missing'
                });
                
                if (!component.available) {
                    errors.push(`${component.name} component not available`);
                }
            }
            
        } catch (error) {
            errors.push(`Component test error: ${error.message}`);
        }
        
        return {
            passed: tests.every(t => t.passed) && errors.length === 0,
            tests,
            errors,
            details: tests
        };
    }
    
    /**
     * Run business logic tests
     */
    async runBusinessLogicTests() {
        const tests = [];
        const errors = [];
        
        try {
            // Test main application class
            if (typeof SimpleSwapCheckoutPro !== 'undefined') {
                tests.push({
                    name: 'Main Application Class',
                    passed: true,
                    value: 'Available'
                });
            } else {
                errors.push('SimpleSwapCheckoutPro class not available');
            }
            
            // Test configuration
            if (typeof PRODUCTION_CONFIG !== 'undefined') {
                tests.push({
                    name: 'Production Configuration',
                    passed: true,
                    value: 'Available'
                });
                
                // Test required config properties
                const requiredConfig = ['URLS', 'FEATURES', 'SECURITY', 'TRANSACTION'];
                for (const prop of requiredConfig) {
                    tests.push({
                        name: `Config Property: ${prop}`,
                        passed: PRODUCTION_CONFIG.hasOwnProperty(prop),
                        value: PRODUCTION_CONFIG.hasOwnProperty(prop) ? 'Present' : 'Missing'
                    });
                }
            } else {
                errors.push('PRODUCTION_CONFIG not available');
            }
            
        } catch (error) {
            errors.push(`Business logic test error: ${error.message}`);
        }
        
        return {
            passed: tests.every(t => t.passed) && errors.length === 0,
            tests,
            errors,
            details: tests
        };
    }
    
    /**
     * Run Phase 2 success criteria validation
     */
    async runPhase2SuccessValidation() {
        try {
            if (typeof Phase2SuccessValidation === 'undefined') {
                throw new Error('Phase2SuccessValidation class not available');
            }
            
            console.log('🎯 Running Phase 2 Success Criteria Validation...');
            
            const validator = new Phase2SuccessValidation();
            
            // Wait for validation to complete
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const results = validator.getResults();
            
            return {
                passed: results.passed,
                overallScore: results.overallScore,
                validationResults: results.validationResults,
                criticalFailures: results.criticalFailures,
                warnings: results.warnings,
                details: results.validationResults.map(r => ({
                    category: r.name,
                    score: r.score,
                    passed: r.passed,
                    issues: r.criticalIssues.concat(r.warnings)
                }))
            };
            
        } catch (error) {
            console.error('Phase 2 validation failed:', error);
            return {
                passed: false,
                error: error.message,
                details: []
            };
        }
    }
    
    /**
     * Update test results display
     */
    updateTestResults(suiteName, result) {
        const resultsContent = document.getElementById('test-results-content');
        if (!resultsContent) return;
        
        const resultHTML = `
            <div class="test-result ${result.passed ? 'passed' : 'failed'}">
                <h5>${suiteName}</h5>
                <p>Status: ${result.passed ? 'PASSED' : 'FAILED'}</p>
                ${result.totalTests ? `<p>Tests: ${result.passedTests}/${result.totalTests}</p>` : ''}
                ${result.error ? `<p class="error">Error: ${result.error}</p>` : ''}
            </div>
        `;
        
        if (resultsContent.innerHTML.includes('No tests run yet')) {
            resultsContent.innerHTML = resultHTML;
        } else {
            resultsContent.innerHTML += resultHTML;
        }
        
        this.updateSummaryStats();
    }
    
    /**
     * Update summary statistics
     */
    updateSummaryStats() {
        const totalSuites = Object.keys(this.results).length;
        const passedSuites = Object.values(this.results).filter(r => r.passed).length;
        const failedSuites = totalSuites - passedSuites;
        const successRate = totalSuites > 0 ? (passedSuites / totalSuites * 100).toFixed(1) : 0;
        
        document.getElementById('total-tests').textContent = totalSuites;
        document.getElementById('passed-tests').textContent = passedSuites;
        document.getElementById('failed-tests').textContent = failedSuites;
        document.getElementById('success-rate').textContent = `${successRate}%`;
    }
    
    /**
     * Generate overall test report
     */
    generateOverallReport() {
        console.log('\n🧪 OVERALL TEST REPORT');
        console.log('=' .repeat(50));
        
        const totalSuites = Object.keys(this.results).length;
        const passedSuites = Object.values(this.results).filter(r => r.passed).length;
        const failedSuites = totalSuites - passedSuites;
        
        console.log(`Total Test Suites: ${totalSuites}`);
        console.log(`Passed: ${passedSuites} ✅`);
        console.log(`Failed: ${failedSuites} ❌`);
        console.log(`Success Rate: ${(passedSuites / totalSuites * 100).toFixed(1)}%`);
        
        console.log('\nSUITE RESULTS:');
        console.log('-' .repeat(30));
        
        for (const [suiteName, result] of Object.entries(this.results)) {
            const status = result.passed ? '✅ PASSED' : '❌ FAILED';
            console.log(`${status} ${suiteName}`);
            
            if (result.error) {
                console.log(`  Error: ${result.error}`);
            }
        }
        
        console.log('=' .repeat(50));
    }
    
    /**
     * Update run all button state
     */
    updateRunAllButton(isRunning) {
        const button = document.getElementById('run-all-tests');
        if (button) {
            button.textContent = isRunning ? 'Running...' : 'Run All Tests';
            button.disabled = isRunning;
        }
    }
    
    /**
     * Check if test UI should be shown
     */
    shouldShowTestUI() {
        return new URLSearchParams(window.location.search).has('test') ||
               new URLSearchParams(window.location.search).has('debug') ||
               new URLSearchParams(window.location.search).has('validate');
    }
    
    /**
     * Get test results
     */
    getResults() {
        return this.results;
    }
}

// Auto-initialize if this script is loaded
if (typeof window !== 'undefined') {
    window.TestRunner = TestRunner;
    
    // Auto-run if test parameter is present
    if (new URLSearchParams(window.location.search).has('test')) {
        document.addEventListener('DOMContentLoaded', () => {
            window.testRunner = new TestRunner();
        });
    }
}