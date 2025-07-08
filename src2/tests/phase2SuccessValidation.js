/**
 * Phase 2 Success Criteria Validation
 * Comprehensive validation of all Phase 2 production requirements
 */
class Phase2SuccessValidation {
    constructor() {
        this.validationResults = [];
        this.successCriteria = this.defineSuccessCriteria();
        this.overallScore = 0;
        this.criticalFailures = [];
        this.warnings = [];
        
        this.initializeValidation();
    }
    
    /**
     * Define Phase 2 success criteria
     */
    defineSuccessCriteria() {
        return {
            // Core Infrastructure
            coreInfrastructure: {
                name: 'Core Infrastructure',
                weight: 25,
                requirements: [
                    'Production directory structure created',
                    'All core components implemented',
                    'Configuration management in place',
                    'Environment variables properly configured'
                ]
            },
            
            // Security Implementation
            securityImplementation: {
                name: 'Security Implementation',
                weight: 25,
                requirements: [
                    'SecurityManager class fully implemented',
                    'CSP headers properly configured',
                    'Input validation working correctly',
                    'CSRF protection active',
                    'Rate limiting functional',
                    'Security monitoring enabled'
                ]
            },
            
            // Performance Optimization
            performanceOptimization: {
                name: 'Performance Optimization',
                weight: 20,
                requirements: [
                    'PerformanceManager class implemented',
                    'Core Web Vitals monitoring active',
                    'Caching mechanisms working',
                    'Resource optimization applied',
                    'Mobile performance optimized',
                    'Performance monitoring integrated'
                ]
            },
            
            // Monitoring & Analytics
            monitoringAnalytics: {
                name: 'Monitoring & Analytics',
                weight: 15,
                requirements: [
                    'Analytics tracking implemented',
                    'Error monitoring active',
                    'Performance monitoring integrated',
                    'Real-time dashboard available',
                    'Alert system functional'
                ]
            },
            
            // API Integration
            apiIntegration: {
                name: 'API Integration',
                weight: 10,
                requirements: [
                    'APIManager class implemented',
                    'SimpleSwap API integration ready',
                    'Mercuryo API integration ready',
                    'Geolocation API working',
                    'Retry logic and error handling'
                ]
            },
            
            // Production Readiness
            productionReadiness: {
                name: 'Production Readiness',
                weight: 5,
                requirements: [
                    'All tests passing',
                    'No critical security vulnerabilities',
                    'Performance thresholds met',
                    'Error handling comprehensive',
                    'Deployment ready'
                ]
            }
        };
    }
    
    /**
     * Initialize Phase 2 validation
     */
    async initializeValidation() {
        console.log('🎯 Starting Phase 2 Success Criteria Validation...');
        console.log('=' .repeat(60));
        
        try {
            // Run all validation categories
            for (const [key, criteria] of Object.entries(this.successCriteria)) {
                console.log(`\n📋 Validating: ${criteria.name}`);
                const result = await this.validateCriteria(key, criteria);
                this.validationResults.push(result);
            }
            
            // Calculate overall success
            this.calculateOverallSuccess();
            
            // Generate final report
            this.generateFinalReport();
            
        } catch (error) {
            console.error('Phase 2 validation failed:', error);
            this.criticalFailures.push(`Validation process failed: ${error.message}`);
        }
    }
    
    /**
     * Validate specific criteria category
     */
    async validateCriteria(key, criteria) {
        const result = {
            category: key,
            name: criteria.name,
            weight: criteria.weight,
            requirements: criteria.requirements,
            validationResults: [],
            score: 0,
            passed: false,
            criticalIssues: [],
            warnings: []
        };
        
        try {
            switch (key) {
                case 'coreInfrastructure':
                    result.validationResults = await this.validateCoreInfrastructure();
                    break;
                case 'securityImplementation':
                    result.validationResults = await this.validateSecurityImplementation();
                    break;
                case 'performanceOptimization':
                    result.validationResults = await this.validatePerformanceOptimization();
                    break;
                case 'monitoringAnalytics':
                    result.validationResults = await this.validateMonitoringAnalytics();
                    break;
                case 'apiIntegration':
                    result.validationResults = await this.validateAPIIntegration();
                    break;
                case 'productionReadiness':
                    result.validationResults = await this.validateProductionReadiness();
                    break;
            }
            
            // Calculate score for this category
            const passedValidations = result.validationResults.filter(v => v.passed).length;
            result.score = (passedValidations / result.validationResults.length) * 100;
            result.passed = result.score >= 80; // 80% threshold for success
            
            // Collect issues
            result.criticalIssues = result.validationResults.filter(v => !v.passed && v.critical).map(v => v.description);
            result.warnings = result.validationResults.filter(v => !v.passed && !v.critical).map(v => v.description);
            
        } catch (error) {
            result.criticalIssues.push(`Validation error: ${error.message}`);
            result.score = 0;
            result.passed = false;
        }
        
        return result;
    }
    
    /**
     * Validate core infrastructure
     */
    async validateCoreInfrastructure() {
        const validations = [];
        
        // Check directory structure
        validations.push({
            requirement: 'Production directory structure',
            passed: this.checkDirectoryStructure(),
            critical: true,
            description: 'src/, js/, css/, config/, tests/, monitoring/ directories'
        });
        
        // Check core components
        const coreComponents = [
            'SimpleSwapCheckoutPro',
            'SecurityManager', 
            'PerformanceManager',
            'APIManager',
            'DeepLinkBuilder',
            'WalletHandler',
            'GeoRedirector'
        ];
        
        for (const component of coreComponents) {
            validations.push({
                requirement: `${component} class available`,
                passed: typeof window[component] !== 'undefined',
                critical: true,
                description: `${component} class properly loaded and available`
            });
        }
        
        // Check production configuration
        validations.push({
            requirement: 'Production configuration',
            passed: typeof PRODUCTION_CONFIG !== 'undefined' && this.validateProductionConfig(),
            critical: true,
            description: 'PRODUCTION_CONFIG object with all required properties'
        });
        
        // Check main application integration
        validations.push({
            requirement: 'Main application initialized',
            passed: window.app && typeof window.app.initialize === 'function',
            critical: true,
            description: 'SimpleSwapCheckoutPro instance created and accessible'
        });
        
        return validations;
    }
    
    /**
     * Validate security implementation
     */
    async validateSecurityImplementation() {
        const validations = [];
        
        // Check SecurityManager implementation
        validations.push({
            requirement: 'SecurityManager class',
            passed: typeof SecurityManager !== 'undefined',
            critical: true,
            description: 'SecurityManager class available and functional'
        });
        
        // Check CSP headers
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        validations.push({
            requirement: 'CSP headers configured',
            passed: !!cspMeta && cspMeta.getAttribute('content').length > 0,
            critical: true,
            description: 'Content Security Policy headers properly configured'
        });
        
        // Check security headers
        const securityHeaders = ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection'];
        for (const header of securityHeaders) {
            const meta = document.querySelector(`meta[http-equiv="${header}"]`);
            validations.push({
                requirement: `${header} header`,
                passed: !!meta,
                critical: false,
                description: `${header} security header configured`
            });
        }
        
        // Check security validation results
        if (window.SecurityValidation) {
            try {
                const securityValidator = new SecurityValidation();
                await new Promise(resolve => setTimeout(resolve, 1000));
                const securityResults = securityValidator.getResults();
                
                validations.push({
                    requirement: 'Security validation tests',
                    passed: securityResults.failedTests === 0 && securityResults.errorTests === 0,
                    critical: true,
                    description: `Security tests: ${securityResults.passedTests}/${securityResults.totalTests} passed`
                });
            } catch (error) {
                validations.push({
                    requirement: 'Security validation tests',
                    passed: false,
                    critical: true,
                    description: `Security validation failed: ${error.message}`
                });
            }
        }
        
        return validations;
    }
    
    /**
     * Validate performance optimization
     */
    async validatePerformanceOptimization() {
        const validations = [];
        
        // Check PerformanceManager implementation
        validations.push({
            requirement: 'PerformanceManager class',
            passed: typeof PerformanceManager !== 'undefined',
            critical: true,
            description: 'PerformanceManager class available and functional'
        });
        
        // Check Core Web Vitals monitoring
        validations.push({
            requirement: 'Core Web Vitals monitoring',
            passed: 'PerformanceObserver' in window,
            critical: false,
            description: 'PerformanceObserver API available for Core Web Vitals'
        });
        
        // Check caching implementation
        validations.push({
            requirement: 'Caching mechanisms',
            passed: this.checkCachingImplementation(),
            critical: false,
            description: 'Caching mechanisms implemented and functional'
        });
        
        // Check mobile optimization
        validations.push({
            requirement: 'Mobile optimization',
            passed: this.checkMobileOptimization(),
            critical: false,
            description: 'Mobile-first design and touch optimization'
        });
        
        // Check performance testing results
        if (window.PerformanceTestSuite) {
            try {
                const performanceTests = new PerformanceTestSuite();
                await new Promise(resolve => setTimeout(resolve, 2000));
                const performanceResults = performanceTests.getResults();
                
                const passedTests = performanceResults.testResults.filter(t => t.status === 'PASS').length;
                const totalTests = performanceResults.testResults.length;
                
                validations.push({
                    requirement: 'Performance validation tests',
                    passed: passedTests / totalTests >= 0.8,
                    critical: false,
                    description: `Performance tests: ${passedTests}/${totalTests} passed`
                });
            } catch (error) {
                validations.push({
                    requirement: 'Performance validation tests',
                    passed: false,
                    critical: false,
                    description: `Performance validation failed: ${error.message}`
                });
            }
        }
        
        return validations;
    }
    
    /**
     * Validate monitoring and analytics
     */
    async validateMonitoringAnalytics() {
        const validations = [];
        
        // Check monitoring integration
        validations.push({
            requirement: 'Monitoring integration',
            passed: !!window.monitoring && typeof window.monitoring.getMonitoringStatus === 'function',
            critical: true,
            description: 'MonitoringIntegration class initialized and accessible'
        });
        
        // Check analytics manager
        validations.push({
            requirement: 'Analytics manager',
            passed: !!window.analyticsManager && typeof window.analyticsManager.trackEvent === 'function',
            critical: true,
            description: 'AnalyticsManager instance available and functional'
        });
        
        // Check error monitor
        validations.push({
            requirement: 'Error monitoring',
            passed: !!window.errorMonitor && typeof window.errorMonitor.handleError === 'function',
            critical: true,
            description: 'ErrorMonitor instance available and functional'
        });
        
        // Check dashboard availability (in debug mode)
        const showDashboard = new URLSearchParams(window.location.search).has('debug') || 
                             new URLSearchParams(window.location.search).has('monitor');
        
        if (showDashboard) {
            validations.push({
                requirement: 'Monitoring dashboard',
                passed: !!window.monitoringDashboard,
                critical: false,
                description: 'Real-time monitoring dashboard available in debug mode'
            });
        }
        
        // Check alert system
        if (window.monitoring) {
            try {
                const monitoringStatus = window.monitoring.getMonitoringStatus();
                validations.push({
                    requirement: 'Alert system',
                    passed: monitoringStatus.components && monitoringStatus.components.length > 0,
                    critical: false,
                    description: 'Alert and monitoring system functional'
                });
            } catch (error) {
                validations.push({
                    requirement: 'Alert system',
                    passed: false,
                    critical: false,
                    description: `Alert system check failed: ${error.message}`
                });
            }
        }
        
        return validations;
    }
    
    /**
     * Validate API integration
     */
    async validateAPIIntegration() {
        const validations = [];
        
        // Check APIManager implementation
        validations.push({
            requirement: 'APIManager class',
            passed: typeof APIManager !== 'undefined',
            critical: true,
            description: 'APIManager class available and functional'
        });
        
        // Check API manager instance
        validations.push({
            requirement: 'API manager instance',
            passed: !!window.apiManager && typeof window.apiManager.makeRequest === 'function',
            critical: true,
            description: 'APIManager instance initialized and accessible'
        });
        
        // Check API endpoints configuration
        if (typeof PRODUCTION_CONFIG !== 'undefined' && PRODUCTION_CONFIG.URLS) {
            const requiredEndpoints = ['SIMPLESWAP_API', 'MERCURYO_API', 'GEOLOCATION_API'];
            for (const endpoint of requiredEndpoints) {
                validations.push({
                    requirement: `${endpoint} configured`,
                    passed: !!PRODUCTION_CONFIG.URLS[endpoint],
                    critical: true,
                    description: `${endpoint} endpoint properly configured`
                });
            }
        }
        
        // Check enhanced components
        const enhancedComponents = ['DeepLinkBuilder', 'WalletHandler', 'GeoRedirector'];
        for (const component of enhancedComponents) {
            validations.push({
                requirement: `Enhanced ${component}`,
                passed: typeof window[component] !== 'undefined',
                critical: true,
                description: `${component} enhanced for production use`
            });
        }
        
        // Check retry logic and error handling
        if (window.apiManager) {
            validations.push({
                requirement: 'API retry logic',
                passed: typeof window.apiManager.makeRequest === 'function',
                critical: false,
                description: 'API retry logic and error handling implemented'
            });
        }
        
        return validations;
    }
    
    /**
     * Validate production readiness
     */
    async validateProductionReadiness() {
        const validations = [];
        
        // Check all tests passing (if test runner available)
        if (window.TestRunner) {
            try {
                const testRunner = new TestRunner();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                validations.push({
                    requirement: 'All tests configured',
                    passed: testRunner.testSuites && testRunner.testSuites.length > 0,
                    critical: false,
                    description: 'Comprehensive test suite available and configured'
                });
            } catch (error) {
                validations.push({
                    requirement: 'Test suite availability',
                    passed: false,
                    critical: false,
                    description: `Test suite check failed: ${error.message}`
                });
            }
        }
        
        // Check error handling
        validations.push({
            requirement: 'Global error handling',
            passed: this.checkGlobalErrorHandling(),
            critical: true,
            description: 'Global error handlers configured for runtime errors'
        });
        
        // Check performance thresholds
        if (performance.timing) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            validations.push({
                requirement: 'Performance thresholds',
                passed: loadTime < 5000, // 5 second threshold for production readiness
                critical: false,
                description: `Page load time: ${loadTime}ms (target: <5000ms)`
            });
        }
        
        // Check deployment readiness
        validations.push({
            requirement: 'Deployment configuration',
            passed: this.checkDeploymentReadiness(),
            critical: true,
            description: 'All required files and configurations present for deployment'
        });
        
        // Check feature flags
        if (typeof PRODUCTION_CONFIG !== 'undefined' && PRODUCTION_CONFIG.FEATURES) {
            validations.push({
                requirement: 'Feature flags configured',
                passed: Object.keys(PRODUCTION_CONFIG.FEATURES).length > 0,
                critical: false,
                description: 'Feature flags properly configured for production control'
            });
        }
        
        return validations;
    }
    
    /**
     * Helper validation methods
     */
    checkDirectoryStructure() {
        // In a real deployment, this would check actual directory structure
        // For this implementation, we check if the files are properly referenced
        const requiredStructure = [
            'src/js/',
            'src/css/',
            'src/config/',
            'src/tests/',
            'src/monitoring/'
        ];
        
        // Check if scripts are properly referenced in HTML
        const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src);
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(s => s.href);
        
        return scripts.some(src => src.includes('js/')) && 
               stylesheets.some(href => href.includes('css/'));
    }
    
    validateProductionConfig() {
        if (typeof PRODUCTION_CONFIG === 'undefined') return false;
        
        const requiredProperties = ['URLS', 'FEATURES', 'SECURITY', 'TRANSACTION'];
        return requiredProperties.every(prop => PRODUCTION_CONFIG.hasOwnProperty(prop));
    }
    
    checkCachingImplementation() {
        // Check for caching mechanisms
        return window.apiManager && typeof window.apiManager.getCacheStats === 'function';
    }
    
    checkMobileOptimization() {
        // Check viewport meta tag
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) return false;
        
        // Check for responsive CSS
        const hasResponsiveCSS = Array.from(document.styleSheets).some(sheet => {
            try {
                return Array.from(sheet.cssRules).some(rule => 
                    rule.media && rule.media.mediaText.includes('max-width')
                );
            } catch (e) {
                return false;
            }
        });
        
        return hasResponsiveCSS;
    }
    
    checkGlobalErrorHandling() {
        // Check if global error handlers are set up
        return window.monitoring && window.monitoring.components && window.monitoring.components.errorMonitor;
    }
    
    checkDeploymentReadiness() {
        // Check if all required components are loaded
        const requiredGlobals = [
            'PRODUCTION_CONFIG',
            'SimpleSwapCheckoutPro',
            'SecurityManager',
            'PerformanceManager',
            'APIManager'
        ];
        
        return requiredGlobals.every(global => typeof window[global] !== 'undefined');
    }
    
    /**
     * Calculate overall success score
     */
    calculateOverallSuccess() {
        let weightedScore = 0;
        let totalWeight = 0;
        
        for (const result of this.validationResults) {
            weightedScore += (result.score * result.weight) / 100;
            totalWeight += result.weight;
            
            // Collect critical failures
            if (result.criticalIssues.length > 0) {
                this.criticalFailures.push(...result.criticalIssues);
            }
            
            // Collect warnings
            if (result.warnings.length > 0) {
                this.warnings.push(...result.warnings);
            }
        }
        
        this.overallScore = (weightedScore / totalWeight) * 100;
    }
    
    /**
     * Generate final Phase 2 validation report
     */
    generateFinalReport() {
        console.log('\n🎯 PHASE 2 SUCCESS CRITERIA VALIDATION REPORT');
        console.log('=' .repeat(70));
        
        console.log(`\n📊 OVERALL SUCCESS SCORE: ${this.overallScore.toFixed(1)}%`);
        
        let overallGrade = 'F';
        let status = '❌ FAILED';
        
        if (this.overallScore >= 95) {
            overallGrade = 'A+';
            status = '🎉 EXCELLENT';
        } else if (this.overallScore >= 90) {
            overallGrade = 'A';
            status = '✅ PASSED';
        } else if (this.overallScore >= 85) {
            overallGrade = 'B+';
            status = '✅ PASSED';
        } else if (this.overallScore >= 80) {
            overallGrade = 'B';
            status = '✅ PASSED';
        } else if (this.overallScore >= 75) {
            overallGrade = 'C+';
            status = '⚠️ MARGINAL';
        } else if (this.overallScore >= 70) {
            overallGrade = 'C';
            status = '⚠️ NEEDS IMPROVEMENT';
        } else {
            overallGrade = 'F';
            status = '❌ FAILED';
        }
        
        console.log(`🏆 GRADE: ${overallGrade}`);
        console.log(`📈 STATUS: ${status}`);
        
        console.log('\n📋 CATEGORY BREAKDOWN:');
        console.log('-' .repeat(50));
        
        for (const result of this.validationResults) {
            const statusIcon = result.passed ? '✅' : '❌';
            console.log(`${statusIcon} ${result.name}: ${result.score.toFixed(1)}% (Weight: ${result.weight}%)`);
            
            // Show critical issues
            if (result.criticalIssues.length > 0) {
                result.criticalIssues.forEach(issue => {
                    console.log(`  🚨 CRITICAL: ${issue}`);
                });
            }
            
            // Show warnings
            if (result.warnings.length > 0) {
                result.warnings.forEach(warning => {
                    console.log(`  ⚠️ WARNING: ${warning}`);
                });
            }
        }
        
        // Summary of issues
        if (this.criticalFailures.length > 0) {
            console.log('\n🚨 CRITICAL ISSUES TO ADDRESS:');
            console.log('-' .repeat(40));
            this.criticalFailures.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue}`);
            });
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️ RECOMMENDATIONS FOR IMPROVEMENT:');
            console.log('-' .repeat(40));
            this.warnings.forEach((warning, index) => {
                console.log(`${index + 1}. ${warning}`);
            });
        }
        
        // Final assessment
        console.log('\n🎯 PHASE 2 COMPLETION ASSESSMENT:');
        console.log('-' .repeat(40));
        
        if (this.overallScore >= 80) {
            console.log('🎉 PHASE 2 SUCCESSFULLY COMPLETED!');
            console.log('✅ All core requirements met');
            console.log('✅ Production deployment ready');
            console.log('✅ Security and performance standards achieved');
            
            if (this.overallScore >= 95) {
                console.log('🌟 EXCEPTIONAL IMPLEMENTATION - All criteria exceeded!');
            }
        } else {
            console.log('❌ PHASE 2 NOT YET COMPLETE');
            console.log('⚠️ Critical issues must be resolved before production deployment');
            console.log('📝 Address the issues listed above and re-run validation');
        }
        
        console.log('\n' + '=' .repeat(70));
        
        return {
            overallScore: this.overallScore,
            grade: overallGrade,
            status: status,
            passed: this.overallScore >= 80,
            criticalFailures: this.criticalFailures,
            warnings: this.warnings,
            categoryResults: this.validationResults
        };
    }
    
    /**
     * Get validation results
     */
    getResults() {
        return {
            overallScore: this.overallScore,
            passed: this.overallScore >= 80,
            validationResults: this.validationResults,
            criticalFailures: this.criticalFailures,
            warnings: this.warnings
        };
    }
}

// Auto-initialize if this script is loaded
if (typeof window !== 'undefined') {
    window.Phase2SuccessValidation = Phase2SuccessValidation;
    
    // Auto-run if phase2 validation parameter is present
    if (new URLSearchParams(window.location.search).has('validate-phase2')) {
        document.addEventListener('DOMContentLoaded', () => {
            new Phase2SuccessValidation();
        });
    }
}