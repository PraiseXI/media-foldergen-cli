/**
 * Creative Structure Web Application
 * Main application logic and UI interactions
 */

class CreativeStructureApp {
    constructor() {
        this.generator = new StructureGenerator();
        this.currentStep = 1;
        this.maxSteps = 3;
        this.projectConfig = {};
        this.clients = this.loadClients();
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.populateDefaultDate();
        this.renderSavedClients();
        this.updateFormVisibility();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navigation
        document.getElementById('start-project-btn').addEventListener('click', () => this.showProjectForm());
        document.getElementById('view-demo-btn').addEventListener('click', () => this.showDemo());
        document.getElementById('back-to-welcome').addEventListener('click', () => this.showWelcome());

        // Form steps
        document.getElementById('step1-next').addEventListener('click', () => this.nextStep());
        document.getElementById('step2-prev').addEventListener('click', () => this.prevStep());
        document.getElementById('step2-next').addEventListener('click', () => this.nextStep());
        document.getElementById('step3-prev').addEventListener('click', () => this.prevStep());
        document.getElementById('create-project-btn').addEventListener('click', () => this.createProject());

        // Project type and work type changes
        document.querySelectorAll('input[name="project-type"]').forEach(input => {
            input.addEventListener('change', () => this.onProjectTypeChange());
        });
        document.querySelectorAll('input[name="work-type"]').forEach(input => {
            input.addEventListener('change', () => this.onWorkTypeChange());
        });

        // Camera setup
        document.getElementById('use-camera-folders').addEventListener('change', (e) => {
            document.getElementById('camera-setup').style.display = e.target.checked ? 'block' : 'none';
            if (e.target.checked && document.getElementById('camera-assignments').children.length === 0) {
                this.addCameraAssignment();
            }
        });
        document.getElementById('add-camera-btn').addEventListener('click', () => this.addCameraAssignment());

        // Client management
        document.getElementById('view-clients-btn').addEventListener('click', () => this.showClientsModal());
        document.getElementById('close-clients-modal').addEventListener('click', () => this.hideClientsModal());
        document.getElementById('add-client-btn').addEventListener('click', () => this.focusAddClientForm());
        document.getElementById('save-client-btn').addEventListener('click', () => this.saveNewClient());

        // Help
        document.getElementById('help-btn').addEventListener('click', () => this.showHelpModal());
        document.getElementById('close-help-modal').addEventListener('click', () => this.hideHelpModal());

        // Preview actions
        document.getElementById('edit-project-btn').addEventListener('click', () => this.editProject());
        document.getElementById('download-structure-btn').addEventListener('click', () => this.downloadStructure());
        document.getElementById('create-another-btn').addEventListener('click', () => this.createAnotherProject());

        // Modal close on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Form validation
        document.getElementById('project-form').addEventListener('submit', (e) => e.preventDefault());
    }

    /**
     * Show project creation form
     */
    showProjectForm() {
        document.getElementById('welcome-section').style.display = 'none';
        document.getElementById('form-section').style.display = 'block';
        document.getElementById('preview-section').style.display = 'none';
        this.currentStep = 1;
        this.updateStepDisplay();
    }

    /**
     * Show welcome section
     */
    showWelcome() {
        document.getElementById('welcome-section').style.display = 'block';
        document.getElementById('form-section').style.display = 'none';
        document.getElementById('preview-section').style.display = 'none';
        this.resetForm();
    }

    /**
     * Show demo (placeholder)
     */
    showDemo() {
        alert('Demo feature coming soon! For now, try creating a project to see how it works.');
    }

    /**
     * Handle project type change
     */
    onProjectTypeChange() {
        const projectType = document.querySelector('input[name="project-type"]:checked')?.value;
        this.updateFormVisibility();
        
        // Show/hide step 3 based on project type
        const hasVideo = projectType === 'video' || projectType === 'both';
        const step3 = document.querySelector('[data-step="3"]');
        const progressStep3 = document.querySelector('.progress-step[data-step="3"]');
        
        if (hasVideo) {
            this.maxSteps = 3;
            step3.style.display = 'block';
            progressStep3.style.display = 'flex';
        } else {
            this.maxSteps = 2;
            step3.style.display = 'none';
            progressStep3.style.display = 'none';
        }
    }

    /**
     * Handle work type change
     */
    onWorkTypeChange() {
        this.updateFormVisibility();
    }

    /**
     * Update form field visibility based on selections
     */
    updateFormVisibility() {
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

    /**
     * Move to next step
     */
    nextStep() {
        if (this.validateCurrentStep()) {
            this.currentStep = Math.min(this.currentStep + 1, this.maxSteps);
            this.updateStepDisplay();
        }
    }

    /**
     * Move to previous step
     */
    prevStep() {
        this.currentStep = Math.max(this.currentStep - 1, 1);
        this.updateStepDisplay();
    }

    /**
     * Update step display
     */
    updateStepDisplay() {
        // Update form steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelector(`[data-step="${this.currentStep}"]`).classList.add('active');

        // Update progress indicators
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNum === this.currentStep) {
                step.classList.add('active');
            }
        });

        // Update progress lines
        document.querySelectorAll('.progress-line').forEach((line, index) => {
            const stepNum = index + 1;
            line.classList.toggle('completed', stepNum < this.currentStep);
        });
    }

    /**
     * Validate current step
     */
    validateCurrentStep() {
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        
        for (const field of requiredFields) {
            if (!field.value.trim()) {
                field.focus();
                this.showError(`Please fill in ${field.labels?.[0]?.textContent || 'this field'}`);
                return false;
            }
        }

        // Additional validation for radio buttons
        const radioGroups = currentStepElement.querySelectorAll('[type="radio"][required]');
        const groupNames = new Set();
        
        radioGroups.forEach(radio => groupNames.add(radio.name));
        
        for (const groupName of groupNames) {
            const checkedRadio = currentStepElement.querySelector(`[name="${groupName}"]:checked`);
            if (!checkedRadio) {
                this.showError(`Please select an option for ${groupName.replace('-', ' ')}`);
                return false;
            }
        }

        return true;
    }

    /**
     * Create project
     */
    async createProject() {
        if (!this.validateCurrentStep()) return;

        // Collect form data
        this.projectConfig = this.collectFormData();
        
        // Validate configuration
        const validation = this.generator.validateConfig(this.projectConfig);
        if (!validation.isValid) {
            this.showError(validation.errors.join('\n'));
            return;
        }

        this.showLoading();

        try {
            // Generate structure
            const structure = this.generator.generateStructure(this.projectConfig);
            
            // Save client if new
            if (this.projectConfig.workType === 'client' && this.projectConfig.clientName) {
                this.saveClientIfNew(this.projectConfig.clientName);
            }

            // Show preview
            this.showPreview(structure);
        } catch (error) {
            console.error('Error creating project:', error);
            this.showError('An error occurred while creating your project. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Collect form data into configuration object
     */
    collectFormData() {
        const config = {
            projectType: document.querySelector('input[name="project-type"]:checked')?.value,
            workType: document.querySelector('input[name="work-type"]:checked')?.value,
            projectName: document.getElementById('project-name').value.trim(),
            projectDate: document.getElementById('project-date').value,
            clientName: document.getElementById('client-name').value.trim(),
            includeCaptureOne: document.getElementById('include-capture-one').checked,
            includeProxies: document.getElementById('include-proxies').checked,
            useCameraFolders: document.getElementById('use-camera-folders').checked,
            cameraAssignments: []
        };

        // Collect camera assignments
        if (config.useCameraFolders) {
            const assignments = document.querySelectorAll('.camera-assignment');
            assignments.forEach(assignment => {
                const purpose = assignment.querySelector('.camera-purpose').value;
                const camera = assignment.querySelector('.camera-name').value.trim();
                if (purpose && camera) {
                    config.cameraAssignments.push({ purpose, camera });
                }
            });
        }

        return config;
    }

    /**
     * Show project preview
     */
    showPreview(structure) {
        document.getElementById('form-section').style.display = 'none';
        document.getElementById('preview-section').style.display = 'block';

        // Populate summary
        this.populateProjectSummary(structure.summary);

        // Show folder preview
        document.getElementById('folder-preview').textContent = structure.preview;

        // Store structure for download
        this.currentStructure = structure;
    }

    /**
     * Populate project summary
     */
    populateProjectSummary(summary) {
        const summaryContainer = document.getElementById('project-summary');
        summaryContainer.innerHTML = `
            <div class="summary-item">
                <div class="summary-label">Project Type</div>
                <div class="summary-value">${summary.projectType}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Work Type</div>
                <div class="summary-value">${summary.workType}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Project Name</div>
                <div class="summary-value">${summary.projectName}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Date</div>
                <div class="summary-value">${summary.projectDate}</div>
            </div>
            ${summary.clientName !== 'N/A' ? `
                <div class="summary-item">
                    <div class="summary-label">Client</div>
                    <div class="summary-value">${summary.clientName}</div>
                </div>
            ` : ''}
            ${summary.features.length > 0 ? `
                <div class="summary-item">
                    <div class="summary-label">Features</div>
                    <div class="summary-value">${summary.features.join(', ')}</div>
                </div>
            ` : ''}
        `;
    }

    /**
     * Edit project (go back to form)
     */
    editProject() {
        document.getElementById('preview-section').style.display = 'none';
        document.getElementById('form-section').style.display = 'block';
    }

    /**
     * Download structure as ZIP
     */
    async downloadStructure() {
        if (!this.currentStructure) return;

        this.showLoading();

        try {
            const blob = await this.generator.createZipFile(this.currentStructure, this.projectConfig.projectName);
            const filename = `${this.projectConfig.projectName.replace(/[^a-z0-9]/gi, '_')}_structure.zip`;
            this.generator.downloadZip(blob, filename);
        } catch (error) {
            console.error('Error creating download:', error);
            this.showError('Failed to create download. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Create another project
     */
    createAnotherProject() {
        this.showWelcome();
    }

    /**
     * Add camera assignment row
     */
    addCameraAssignment() {
        const container = document.getElementById('camera-assignments');
        const assignmentDiv = document.createElement('div');
        assignmentDiv.className = 'camera-assignment';
        
        assignmentDiv.innerHTML = `
            <div class="form-group">
                <label>Purpose</label>
                <select class="camera-purpose" required>
                    <option value="">Select purpose</option>
                    <option value="main">Main</option>
                    <option value="BTS">BTS</option>
                    <option value="secondary">Secondary</option>
                    <option value="drone">Drone</option>
                    <option value="interview">Interview</option>
                    <option value="detail">Detail</option>
                    <option value="backup">Backup</option>
                </select>
            </div>
            <div class="form-group">
                <label>Camera</label>
                <input type="text" class="camera-name" placeholder="e.g., Canon R5" required>
            </div>
            <button type="button" class="remove-camera-btn" onclick="this.parentElement.remove()">
                Remove
            </button>
        `;
        
        container.appendChild(assignmentDiv);
    }

    /**
     * Client management methods
     */
    showClientsModal() {
        this.renderClientList();
        document.getElementById('clients-modal').classList.add('active');
    }

    hideClientsModal() {
        document.getElementById('clients-modal').classList.remove('active');
    }

    focusAddClientForm() {
        document.getElementById('new-client-name').focus();
    }

    saveNewClient() {
        const name = document.getElementById('new-client-name').value.trim();
        const notes = document.getElementById('new-client-notes').value.trim();

        if (!name) {
            this.showError('Client name is required');
            return;
        }

        if (this.clients.find(c => c.name.toLowerCase() === name.toLowerCase())) {
            this.showError('Client already exists');
            return;
        }

        const client = {
            id: Date.now(),
            name,
            notes,
            created: new Date().toISOString()
        };

        this.clients.push(client);
        this.saveClients();
        this.renderClientList();
        this.renderSavedClients();

        // Clear form
        document.getElementById('new-client-name').value = '';
        document.getElementById('new-client-notes').value = '';

        this.showSuccess('Client saved successfully');
    }

    renderClientList() {
        const container = document.getElementById('client-list');
        
        if (this.clients.length === 0) {
            container.innerHTML = '<p>No clients saved yet.</p>';
            return;
        }

        container.innerHTML = this.clients.map(client => `
            <div class="client-item">
                <div class="client-info">
                    <h4>${client.name}</h4>
                    ${client.notes ? `<p>${client.notes}</p>` : ''}
                </div>
                <div class="client-actions">
                    <button class="btn btn-outline btn-small" onclick="app.selectClient('${client.name}')">
                        Select
                    </button>
                    <button class="btn btn-text btn-small" onclick="app.removeClient(${client.id})">
                        Remove
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderSavedClients() {
        const container = document.getElementById('saved-clients');
        const datalist = document.getElementById('clients-list');
        
        // Update datalist for autocomplete
        datalist.innerHTML = this.clients.map(client => 
            `<option value="${client.name}">`
        ).join('');

        // Update saved clients display
        if (this.clients.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.clients.map(client => 
            `<span class="client-tag" onclick="app.selectClient('${client.name}')">${client.name}</span>`
        ).join('');
    }

    selectClient(name) {
        document.getElementById('client-name').value = name;
        this.hideClientsModal();
    }

    removeClient(id) {
        if (confirm('Are you sure you want to remove this client?')) {
            this.clients = this.clients.filter(c => c.id !== id);
            this.saveClients();
            this.renderClientList();
            this.renderSavedClients();
        }
    }

    saveClientIfNew(name) {
        if (!this.clients.find(c => c.name.toLowerCase() === name.toLowerCase())) {
            const client = {
                id: Date.now(),
                name,
                notes: '',
                created: new Date().toISOString()
            };
            this.clients.push(client);
            this.saveClients();
            this.renderSavedClients();
        }
    }

    /**
     * Help modal
     */
    showHelpModal() {
        document.getElementById('help-modal').classList.add('active');
    }

    hideHelpModal() {
        document.getElementById('help-modal').classList.remove('active');
    }

    /**
     * Utility methods
     */
    populateDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('project-date').value = today;
    }

    resetForm() {
        document.getElementById('project-form').reset();
        this.populateDefaultDate();
        this.currentStep = 1;
        this.updateStepDisplay();
        this.updateFormVisibility();
        document.getElementById('camera-assignments').innerHTML = '';
        document.getElementById('camera-setup').style.display = 'none';
    }

    showLoading() {
        document.getElementById('loading-overlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('active');
    }

    showError(message) {
        alert(`Error: ${message}`);
    }

    showSuccess(message) {
        alert(message);
    }

    /**
     * Local storage methods
     */
    loadClients() {
        try {
            const stored = localStorage.getItem('creative-structure-clients');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading clients:', error);
            return [];
        }
    }

    saveClients() {
        try {
            localStorage.setItem('creative-structure-clients', JSON.stringify(this.clients));
        } catch (error) {
            console.error('Error saving clients:', error);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CreativeStructureApp();
});

// Global functions for inline event handlers
window.selectClient = (name) => window.app.selectClient(name);
window.removeClient = (id) => window.app.removeClient(id); 