/**
 * Creative Structure Web Application
 * Main application logic and UI interactions
 */

class CreativeStructureApp {
    constructor() {
        try {
            this.generator = new StructureGenerator();
            this.clients = this.loadClients();
            this.currentProject = null;
            this.currentStep = 1;
            this.errorHandler = new ErrorHandler();
            
            this.init();
        } catch (error) {
            this.handleError('Failed to initialize application', error);
        }
    }

    init() {
        this.setupEventListeners();
        this.loadSavedClients();
        this.setDefaultDate();
    }

    setupEventListeners() {
        try {
            // Navigation
            this.safeAddEventListener('start-project-btn', 'click', () => this.showForm());
            this.safeAddEventListener('view-demo-btn', 'click', () => window.open('../index.html', '_blank'));
            this.safeAddEventListener('back-to-welcome', 'click', () => this.showWelcome());
            
            // Form steps
            this.safeAddEventListener('step1-next', 'click', () => this.nextStep());
            this.safeAddEventListener('step2-prev', 'click', () => this.prevStep());
            this.safeAddEventListener('step2-next', 'click', () => this.nextStep());
            this.safeAddEventListener('step3-prev', 'click', () => this.prevStep());
            
            // Form submission
            this.safeAddEventListener('create-project-btn', 'click', () => this.createProject());
            
            // Project actions
            this.safeAddEventListener('edit-project-btn', 'click', () => this.editProject());
            this.safeAddEventListener('download-structure-btn', 'click', () => this.downloadStructure());
            this.safeAddEventListener('create-another-btn', 'click', () => this.createAnother());
            
            // Client management
            this.safeAddEventListener('view-clients-btn', 'click', () => this.showClientsModal());
            this.safeAddEventListener('add-client-btn', 'click', () => this.showAddClientForm());
            this.safeAddEventListener('save-client-btn', 'click', () => this.saveClient());
            this.safeAddEventListener('close-clients-modal', 'click', () => this.closeClientsModal());
            
            // Help
            this.safeAddEventListener('help-btn', 'click', () => this.showHelpModal());
            this.safeAddEventListener('close-help-modal', 'click', () => this.closeHelpModal());
            
            // Form changes
            const workTypeInput = document.querySelector('input[name="work-type"]');
            if (workTypeInput) {
                workTypeInput.addEventListener('change', (e) => this.handleWorkTypeChange(e));
            }
            
            this.safeAddEventListener('use-camera-folders', 'change', (e) => this.handleCameraFoldersChange(e));
            this.safeAddEventListener('add-camera-btn', 'click', () => this.addCameraAssignment());
            
            // Client input
            this.safeAddEventListener('client-name', 'input', (e) => this.handleClientInput(e));
            
            // Modal backdrop clicks
            this.safeAddEventListener('clients-modal', 'click', (e) => {
                if (e.target === e.currentTarget) this.closeClientsModal();
            });
            this.safeAddEventListener('help-modal', 'click', (e) => {
                if (e.target === e.currentTarget) this.closeHelpModal();
            });

            // Global error handling
            window.addEventListener('error', (e) => this.handleGlobalError(e));
            window.addEventListener('unhandledrejection', (e) => this.handleUnhandledRejection(e));
            
        } catch (error) {
            this.handleError('Failed to setup event listeners', error);
        }
    }

    safeAddEventListener(elementId, event, handler) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener(event, (e) => {
                    try {
                        handler(e);
                    } catch (error) {
                        this.handleError(`Error in ${elementId} ${event} handler`, error);
                    }
                });
            } else {
                console.warn(`Element with ID '${elementId}' not found`);
            }
        } catch (error) {
            this.handleError(`Failed to add event listener to ${elementId}`, error);
        }
    }

    // Navigation Methods
    showWelcome() {
        document.getElementById('welcome-section').style.display = 'block';
        document.getElementById('form-section').style.display = 'none';
        document.getElementById('preview-section').style.display = 'none';
    }

    showForm() {
        document.getElementById('welcome-section').style.display = 'none';
        document.getElementById('form-section').style.display = 'block';
        document.getElementById('preview-section').style.display = 'none';
        this.currentStep = 1;
        this.updateStep();
    }

    showPreview() {
        document.getElementById('welcome-section').style.display = 'none';
        document.getElementById('form-section').style.display = 'none';
        document.getElementById('preview-section').style.display = 'block';
    }

    // Step Management
    nextStep() {
        if (this.validateCurrentStep()) {
            this.currentStep++;
            this.updateStep();
        }
    }

    prevStep() {
        this.currentStep--;
        this.updateStep();
    }

    updateStep() {
        // Update progress indicators
        document.querySelectorAll('.progress-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum <= this.currentStep);
        });

        // Show current step
        document.querySelectorAll('.form-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum === this.currentStep);
        });

        // Update step-specific content
        if (this.currentStep === 2) {
            this.updateStep2();
        } else if (this.currentStep === 3) {
            this.updateStep3();
        }
    }

    updateStep2() {
        const workType = document.querySelector('input[name="work-type"]:checked')?.value;
        const clientGroup = document.getElementById('client-group');
        
        if (workType === 'client') {
            clientGroup.style.display = 'block';
            document.getElementById('client-name').required = true;
        } else {
            clientGroup.style.display = 'none';
            document.getElementById('client-name').required = false;
        }
    }

    updateStep3() {
        const projectType = document.querySelector('input[name="project-type"]:checked')?.value;
        const step3 = document.querySelector('.form-step[data-step="3"]');
        
        if (projectType === 'photo') {
            // Skip camera setup for photo-only projects
            this.createProject();
            return;
        }
        
        // Show camera setup for video projects
        step3.style.display = 'block';
    }

    validateCurrentStep() {
        try {
            const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
            if (!currentStepElement) {
                throw new Error(`Step ${this.currentStep} not found`);
            }

            const requiredFields = currentStepElement.querySelectorAll('input[required], select[required]');
            
            let isValid = true;
            const errors = [];

            requiredFields.forEach(field => {
                const fieldName = field.name || field.id || 'Unknown field';
                
                if (!field.value.trim()) {
                    field.classList.add('error');
                    errors.push(`${fieldName} is required`);
                    isValid = false;
                } else {
                    field.classList.remove('error');
                    
                    // Additional validation based on field type
                    if (field.type === 'email' && !this.isValidEmail(field.value)) {
                        field.classList.add('error');
                        errors.push(`${fieldName} must be a valid email`);
                        isValid = false;
                    }
                    
                    if (field.type === 'date' && !this.isValidDate(field.value)) {
                        field.classList.add('error');
                        errors.push(`${fieldName} must be a valid date`);
                        isValid = false;
                    }
                }
            });

            if (!isValid) {
                this.showValidationErrors(errors);
            }
            
            return isValid;
        } catch (error) {
            this.handleError('Validation failed', error);
            return false;
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidDate(date) {
        const dateObj = new Date(date);
        return dateObj instanceof Date && !isNaN(dateObj);
    }

    showValidationErrors(errors) {
        if (errors.length > 0) {
            this.errorHandler.showError('Please fix the following issues:', errors.join('\n'));
        }
    }

    // Form Handlers
    handleWorkTypeChange(e) {
        this.updateStep2();
    }

    handleCameraFoldersChange(e) {
        const cameraSetup = document.getElementById('camera-setup');
        if (e.target.checked) {
            cameraSetup.style.display = 'block';
            this.addCameraAssignment(); // Add first camera by default
        } else {
            cameraSetup.style.display = 'none';
            document.getElementById('camera-assignments').innerHTML = '';
        }
    }

    addCameraAssignment() {
        const assignments = document.getElementById('camera-assignments');
        const index = assignments.children.length;
        
        const assignment = document.createElement('div');
        assignment.className = 'camera-assignment';
        assignment.innerHTML = `
            <div class="form-group">
                <label>Camera Name</label>
                <input type="text" name="camera-name-${index}" placeholder="e.g., Main Camera, Drone, etc." required>
            </div>
            <div class="form-group">
                <label>Folder Name</label>
                <input type="text" name="camera-folder-${index}" placeholder="e.g., Camera 1, Drone, etc." required>
            </div>
            <div class="form-group">
                <label>Role</label>
                <select name="camera-role-${index}">
                    <option value="main">Main</option>
                    <option value="wide">Wide Shots</option>
                    <option value="close">Close Ups</option>
                    <option value="detail">Detail Shots</option>
                    <option value="bts">Behind the Scenes</option>
                    <option value="drone">Drone</option>
                    <option value="interview">Interview</option>
                    <option value="broll">B-Roll</option>
                </select>
            </div>
            <button type="button" class="remove-camera-btn" onclick="this.parentElement.remove()">Remove</button>
        `;
        
        assignments.appendChild(assignment);
    }

    // Client Management
    handleClientInput(e) {
        const value = e.target.value.trim();
        if (value) {
            this.showClientSuggestions(value);
        }
    }

    showClientSuggestions(query) {
        const suggestions = this.clients.filter(client => 
            client.name.toLowerCase().includes(query.toLowerCase())
        );
        
        const datalist = document.getElementById('clients-list');
        datalist.innerHTML = '';
        
        suggestions.forEach(client => {
            const option = document.createElement('option');
            option.value = client.name;
            datalist.appendChild(option);
        });
    }

    showClientsModal() {
        this.renderClientsList();
        document.getElementById('clients-modal').classList.add('active');
    }

    closeClientsModal() {
        document.getElementById('clients-modal').classList.remove('active');
    }

    renderClientsList() {
        const clientList = document.getElementById('client-list');
        clientList.innerHTML = '';
        
        if (this.clients.length === 0) {
            clientList.innerHTML = '<p>No clients saved yet. Add your first client below!</p>';
            return;
        }
        
        this.clients.forEach((client, index) => {
            const clientItem = document.createElement('div');
            clientItem.className = 'client-item';
            clientItem.innerHTML = `
                <div>
                    <strong>${client.name}</strong>
                    ${client.notes ? `<p style="color: #666; font-size: 0.9em; margin: 0.25rem 0 0 0;">${client.notes}</p>` : ''}
                </div>
                <button class="btn btn-text" onclick="app.deleteClient(${index})" style="color: #dc2626;">Delete</button>
            `;
            clientList.appendChild(clientItem);
        });
    }

    showAddClientForm() {
        document.getElementById('new-client-name').value = '';
        document.getElementById('new-client-notes').value = '';
        document.getElementById('new-client-name').focus();
    }

    saveClient() {
        const name = document.getElementById('new-client-name').value.trim();
        const notes = document.getElementById('new-client-notes').value.trim();
        
        if (!name) {
            alert('Please enter a client name');
            return;
        }
        
        // Check if client already exists
        if (this.clients.some(client => client.name.toLowerCase() === name.toLowerCase())) {
            alert('A client with this name already exists');
            return;
        }
        
        this.clients.push({ name, notes });
        this.saveClients();
        this.renderClientsList();
        this.loadSavedClients();
        
        // Clear form
        document.getElementById('new-client-name').value = '';
        document.getElementById('new-client-notes').value = '';
        
        // Show success message
        alert('Client saved successfully!');
    }

    deleteClient(index) {
        if (confirm('Are you sure you want to delete this client?')) {
            this.clients.splice(index, 1);
            this.saveClients();
            this.renderClientsList();
            this.loadSavedClients();
        }
    }

    loadSavedClients() {
        const savedClients = document.getElementById('saved-clients');
        savedClients.innerHTML = '';
        
        this.clients.forEach(client => {
            const tag = document.createElement('span');
            tag.className = 'client-tag';
            tag.textContent = client.name;
            tag.onclick = () => {
                document.getElementById('client-name').value = client.name;
            };
            savedClients.appendChild(tag);
        });
    }

    // Help Modal
    showHelpModal() {
        document.getElementById('help-modal').classList.add('active');
    }

    closeHelpModal() {
        document.getElementById('help-modal').classList.remove('active');
    }

    // Project Creation
    async createProject() {
        try {
            const formElement = document.getElementById('project-form');
            if (!formElement) {
                throw new Error('Project form not found');
            }

            const formData = new FormData(formElement);
            const config = this.buildProjectConfig(formData);
            
            // Validate configuration
            const validation = this.generator.validateConfig(config);
            if (!validation.isValid) {
                this.errorHandler.showError('Configuration Error', validation.errors.join('\n'));
                return;
            }
            
            // Show loading
            this.showLoading('Creating your project structure...');
            
            try {
                // Simulate processing time with actual work
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                this.currentProject = this.generator.generateStructure(config);
                
                if (!this.currentProject) {
                    throw new Error('Failed to generate project structure');
                }
                
                this.showProjectPreview();
                this.hideLoading();
                
                // Save client if new
                if (config.workType === 'client' && config.clientName) {
                    this.saveClientIfNew(config.clientName);
                }
                
            } catch (generationError) {
                this.hideLoading();
                throw new Error(`Project generation failed: ${generationError.message}`);
            }
            
        } catch (error) {
            this.hideLoading();
            this.handleError('Failed to create project', error);
        }
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        const messageElement = overlay?.querySelector('.loading-message');
        
        if (overlay) {
            overlay.classList.add('active');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    saveClientIfNew(clientName) {
        try {
            const existingClient = this.clients.find(c => 
                c.name.toLowerCase() === clientName.toLowerCase()
            );
            
            if (!existingClient) {
                this.clients.push({
                    name: clientName,
                    dateAdded: new Date().toISOString()
                });
                this.saveClients();
                this.loadSavedClients();
            }
        } catch (error) {
            console.warn('Failed to save new client:', error);
        }
    }

    buildProjectConfig(formData) {
        const config = {
            projectType: formData.get('project-type'),
            workType: formData.get('work-type'),
            projectName: formData.get('project-name'),
            projectDate: formData.get('project-date'),
            includeCaptureOne: formData.get('include-capture-one') === 'on',
            includeProxies: formData.get('include-proxies') === 'on',
            useCameraFolders: formData.get('use-camera-folders') === 'on'
        };
        
        if (config.workType === 'client') {
            config.clientName = formData.get('client-name');
        }
        
        // Build camera assignments if enabled
        if (config.useCameraFolders) {
            config.cameraAssignments = [];
            const assignments = document.querySelectorAll('.camera-assignment');
            assignments.forEach((assignment, index) => {
                const name = assignment.querySelector(`input[name="camera-name-${index}"]`)?.value;
                const folder = assignment.querySelector(`input[name="camera-folder-${index}"]`)?.value;
                const role = assignment.querySelector(`select[name="camera-role-${index}"]`)?.value;
                
                if (name && folder) {
                    config.cameraAssignments.push({ name, folder, role });
                }
            });
        }
        
        return config;
    }

    showProjectPreview() {
        this.showPreview();
        this.renderProjectSummary();
        this.renderFolderStructure();
    }

    renderProjectSummary() {
        const summary = this.currentProject.summary;
        const summaryElement = document.getElementById('project-summary');
        
        summaryElement.innerHTML = `
            <div class="summary-item">
                <div class="summary-label">Project Name</div>
                <div class="summary-value">${summary.projectName}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Type</div>
                <div class="summary-value">${summary.projectType}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Work Type</div>
                <div class="summary-value">${summary.workType}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Date</div>
                <div class="summary-value">${summary.projectDate}</div>
            </div>
            ${summary.clientName ? `
                <div class="summary-item">
                    <div class="summary-label">Client</div>
                    <div class="summary-value">${summary.clientName}</div>
                </div>
            ` : ''}
        `;
    }

    renderFolderStructure() {
        const preview = document.getElementById('folder-preview');
        const tree = this.generator.generateFolderTree(this.currentProject);
        preview.textContent = tree;
    }

    editProject() {
        this.showForm();
    }

    createAnother() {
        document.getElementById('project-form').reset();
        this.currentStep = 1;
        this.setDefaultDate();
        this.showForm();
    }

    // Download Functionality
    async downloadStructure() {
        try {
            if (!this.currentProject) {
                throw new Error('No project structure available to download');
            }

            if (!window.JSZip) {
                throw new Error('JSZip library not loaded');
            }
            
            this.showLoading('Preparing download...');
            
            const zip = new JSZip();
            
            // Add all folders
            if (this.currentProject.folders && Array.isArray(this.currentProject.folders)) {
                this.currentProject.folders.forEach(folder => {
                    if (folder) {
                        zip.folder(folder);
                    }
                });
            }
            
            // Add all files
            if (this.currentProject.files && Array.isArray(this.currentProject.files)) {
                this.currentProject.files.forEach(file => {
                    if (file && file.path && file.content !== undefined) {
                        zip.file(file.path, file.content);
                    }
                });
            }
            
            // Generate and download
            try {
                const blob = await zip.generateAsync({ 
                    type: 'blob',
                    compression: 'DEFLATE',
                    compressionOptions: { level: 6 }
                });
                
                if (!blob) {
                    throw new Error('Failed to generate ZIP file');
                }
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${this.sanitizeFilename(this.currentProject.summary.projectName)}-structure.zip`;
                a.style.display = 'none';
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Clean up
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                
                this.hideLoading();
                this.errorHandler.showSuccess('Download completed successfully!');
                
            } catch (zipError) {
                throw new Error(`ZIP generation failed: ${zipError.message}`);
            }
            
        } catch (error) {
            this.hideLoading();
            this.handleError('Download failed', error);
        }
    }

    sanitizeFilename(filename) {
        return filename.replace(/[^a-z0-9\-_\s]/gi, '').replace(/\s+/g, '-');
    }

    // Utility Methods
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('project-date').value = today;
    }

    loadClients() {
        try {
            const stored = localStorage.getItem('creative-structure-clients');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to load clients from localStorage:', error);
            return [];
        }
    }

    saveClients() {
        try {
            localStorage.setItem('creative-structure-clients', JSON.stringify(this.clients));
        } catch (error) {
            console.warn('Failed to save clients to localStorage:', error);
        }
    }

    // Error Handling
    handleError(context, error) {
        console.error(`${context}:`, error);
        
        if (this.errorHandler) {
            this.errorHandler.showError(context, error.message || 'An unexpected error occurred');
        } else {
            // Fallback if error handler not initialized
            alert(`${context}: ${error.message || 'An unexpected error occurred'}`);
        }
    }

    handleGlobalError(event) {
        this.handleError('Global Error', {
            message: event.error?.message || event.message || 'Unknown error',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    }

    handleUnhandledRejection(event) {
        this.handleError('Unhandled Promise Rejection', {
            message: event.reason?.message || event.reason || 'Promise rejected'
        });
        event.preventDefault();
    }
}

/**
 * Error Handler Class
 * Manages error display and user feedback
 */
class ErrorHandler {
    constructor() {
        this.createErrorModal();
    }

    createErrorModal() {
        // Check if error modal already exists
        if (document.getElementById('error-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'error-modal';
        modal.className = 'modal error-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header error-header">
                    <h3 id="error-title">Error</h3>
                    <button id="close-error-modal" class="btn-text">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="error-message"></div>
                    <div class="error-actions">
                        <button id="retry-error-btn" class="btn btn-primary" style="display: none;">Retry</button>
                        <button id="dismiss-error-btn" class="btn btn-outline">OK</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('close-error-modal').addEventListener('click', () => this.hideError());
        document.getElementById('dismiss-error-btn').addEventListener('click', () => this.hideError());
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideError();
        });
    }

    showError(title, message, retryCallback = null) {
        const modal = document.getElementById('error-modal');
        const titleElement = document.getElementById('error-title');
        const messageElement = document.getElementById('error-message');
        const retryBtn = document.getElementById('retry-error-btn');

        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;

        if (retryCallback && retryBtn) {
            retryBtn.style.display = 'inline-block';
            retryBtn.onclick = () => {
                this.hideError();
                retryCallback();
            };
        } else if (retryBtn) {
            retryBtn.style.display = 'none';
        }

        if (modal) {
            modal.classList.add('active');
        }
    }

    showSuccess(message) {
        // Create temporary success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    notification.parentNode.removeChild(notification);
                }, 300);
            }
        }, 3000);
    }

    hideError() {
        const modal = document.getElementById('error-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CreativeStructureApp();
}); 