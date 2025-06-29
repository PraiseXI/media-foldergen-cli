/**
 * Documentation Page JavaScript
 * Handles navigation, interactions, and dynamic content
 */

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.docs-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active state from all tabs
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Activate corresponding tab
    const targetTab = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Scroll to top of content
    document.querySelector('.docs-content').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// Folder Example Tabs
function showExample(exampleType) {
    // Hide all examples
    document.querySelectorAll('.example').forEach(example => {
        example.classList.remove('active');
    });
    
    // Remove active state from all example tabs
    document.querySelectorAll('.example-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected example
    const targetExample = document.getElementById(`${exampleType}-example`);
    if (targetExample) {
        targetExample.classList.add('active');
    }
    
    // Activate corresponding tab
    const targetTab = document.querySelector(`[onclick="showExample('${exampleType}')"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

// FAQ Toggle Functionality
function toggleFaq(questionElement) {
    const faqItem = questionElement.parentElement;
    const isOpen = faqItem.classList.contains('open');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('open');
    });
    
    // If this item wasn't open, open it
    if (!isOpen) {
        faqItem.classList.add('open');
    }
}

// Copy Code Functionality
function copyCode(button) {
    const codeBlock = button.parentElement;
    const preElement = codeBlock.querySelector('pre');
    const code = preElement.textContent;
    
    // Create a temporary textarea to copy the text
    const textarea = document.createElement('textarea');
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    // Update button state
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('copied');
    
    // Reset button after 2 seconds
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
    }, 2000);
}

// Smooth Scrolling for Hash Links
function handleHashLinks() {
    const hashLinks = document.querySelectorAll('a[href^="#"]');
    
    hashLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            
            // Handle section navigation
            if (['quick-start', 'technical', 'faq', 'install'].includes(targetId)) {
                e.preventDefault();
                showSection(targetId);
            }
        });
    });
}

// Initialize Page Functionality
function initializePage() {
    // Handle hash links
    handleHashLinks();
    
    // Set up keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape key closes open FAQ items
        if (e.key === 'Escape') {
            document.querySelectorAll('.faq-item.open').forEach(item => {
                item.classList.remove('open');
            });
        }
        
        // Ctrl/Cmd + K focuses search (placeholder for future search functionality)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            // Focus search input when implemented
        }
    });
    
    // Add smooth scrolling behavior to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement && !['quick-start', 'technical', 'faq', 'install'].includes(targetId)) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Initialize external link handling
    initializeExternalLinks();
    
    // Check for section hash in URL on page load
    const urlHash = window.location.hash.substring(1);
    if (['quick-start', 'technical', 'faq', 'install'].includes(urlHash)) {
        showSection(urlHash);
    }
}

// External Link Handling
function initializeExternalLinks() {
    // Add external link indicators and target="_blank" to external links
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    
    externalLinks.forEach(link => {
        // Skip if already has target
        if (!link.hasAttribute('target')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
        
        // Add external link icon if not already present
        if (!link.querySelector('.external-icon')) {
            const icon = document.createElement('span');
            icon.className = 'external-icon';
            icon.innerHTML = ' ↗';
            icon.style.fontSize = '0.8em';
            icon.style.opacity = '0.7';
            link.appendChild(icon);
        }
    });
}

// Copy Installation Commands
function copyInstallCommand(type) {
    let command = '';
    
    switch(type) {
        case 'github':
            command = `git clone https://github.com/PraiseXI/media-foldergen-cli.git
cd media-foldergen-cli
pip install -e .`;
            break;
        case 'pip':
            command = 'pip install creative-structure-cli';
            break;
        case 'curl':
            command = 'curl -sSL https://raw.githubusercontent.com/PraiseXI/media-foldergen-cli/main/install.sh | bash';
            break;
        default:
            return;
    }
    
    // Create temporary textarea and copy
    const textarea = document.createElement('textarea');
    textarea.value = command;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    // Show feedback
    showCopyFeedback();
}

// Show Copy Feedback
function showCopyFeedback() {
    // Create or update feedback element
    let feedback = document.getElementById('copy-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'copy-feedback';
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        feedback.textContent = '✅ Copied to clipboard!';
        document.body.appendChild(feedback);
    }
    
    // Show feedback
    setTimeout(() => {
        feedback.style.transform = 'translateX(0)';
    }, 10);
    
    // Hide feedback after 3 seconds
    setTimeout(() => {
        feedback.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }, 3000);
}

// Search Functionality (placeholder for future implementation)
function initializeSearch() {
    // This is a placeholder for search functionality
    // Could implement client-side search through documentation content
    console.log('Search functionality placeholder - to be implemented');
}

// Analytics Event Tracking (placeholder)
function trackEvent(category, action, label = '') {
    // Placeholder for analytics tracking
    console.log(`Analytics: ${category} - ${action} - ${label}`);
    
    // Example: Track which sections are most viewed
    if (category === 'documentation' && action === 'section_view') {
        localStorage.setItem('docs_last_section', label);
    }
}

// Progressive Enhancement Features
function enhanceUserExperience() {
    // Add loading states to buttons
    const buttons = document.querySelectorAll('.btn-install, .btn-option');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Skip for anchor links
            if (this.tagName.toLowerCase() === 'a' && this.getAttribute('href')) {
                return;
            }
            
            const originalText = this.innerHTML;
            this.innerHTML = '<span style="opacity: 0.7;">Loading...</span>';
            this.style.pointerEvents = 'none';
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.pointerEvents = 'auto';
            }, 1000);
        });
    });
    
    // Add hover effects to code blocks
    const codeBlocks = document.querySelectorAll('.code-block');
    codeBlocks.forEach(block => {
        block.addEventListener('mouseenter', function() {
            const copyBtn = this.querySelector('.copy-btn');
            if (copyBtn) {
                copyBtn.style.opacity = '1';
            }
        });
        
        block.addEventListener('mouseleave', function() {
            const copyBtn = this.querySelector('.copy-btn');
            if (copyBtn) {
                copyBtn.style.opacity = '0.7';
            }
        });
    });
}

// Handle Browser Back/Forward
function handleBrowserNavigation() {
    window.addEventListener('popstate', function(e) {
        const urlHash = window.location.hash.substring(1);
        if (['quick-start', 'technical', 'faq', 'install'].includes(urlHash)) {
            showSection(urlHash);
        }
    });
}

// Update URL Hash
function updateUrlHash(sectionId) {
    if (history.pushState) {
        history.pushState(null, null, `#${sectionId}`);
    } else {
        window.location.hash = sectionId;
    }
}

// Enhanced Section Navigation with URL Updates
function showSectionWithHistory(sectionId) {
    showSection(sectionId);
    updateUrlHash(sectionId);
    trackEvent('documentation', 'section_view', sectionId);
}

// Accessibility Enhancements
function enhanceAccessibility() {
    // Add ARIA labels to interactive elements
    document.querySelectorAll('.tab-btn').forEach((tab, index) => {
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
        tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');
    });
    
    // Add keyboard navigation for tabs
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Add ARIA labels to FAQ items
    document.querySelectorAll('.faq-question').forEach((question, index) => {
        question.setAttribute('role', 'button');
        question.setAttribute('aria-expanded', 'false');
        question.setAttribute('aria-controls', `faq-answer-${index}`);
        
        const answer = question.nextElementSibling;
        if (answer) {
            answer.setAttribute('id', `faq-answer-${index}`);
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    enhanceUserExperience();
    handleBrowserNavigation();
    enhanceAccessibility();
    
    // Override tab button clicks to include history
    document.querySelectorAll('.tab-btn').forEach(tab => {
        const onclick = tab.getAttribute('onclick');
        if (onclick) {
            const match = onclick.match(/showSection\('([^']+)'\)/);
            if (match) {
                const sectionId = match[1];
                tab.removeAttribute('onclick');
                tab.addEventListener('click', () => showSectionWithHistory(sectionId));
            }
        }
    });
    
    console.log('📖 Documentation page initialized');
});

// Service Worker Registration (for future offline support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(function(registration) {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch(function(registrationError) {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
} 