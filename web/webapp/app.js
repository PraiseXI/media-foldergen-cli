/**
 * Creative Structure Web Application
 * Main application logic and UI interactions
 */

class CreativeStructureApp {
    constructor() {
        this.generator = new StructureGenerator();
        this.clients = this.loadClients();
        this.currentProject = null;
        this.currentStep = 1;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedClients();
        this.setDefaultDate();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('start-project-btn').addEventListener('click', () => this.showForm());
        document.getElementById('view-demo-btn').addEventListener('click', () => window.open('../index.html', '_blank'));
        document.getElementById('back-to-welcome').addEventListener('click', () => this.showWelcome());
        
        // Form steps
        document.getElementById('step1-next').addEventListener('click', () => this.nextStep());
        document.getElementById('step2-prev').addEventListener('click', () => this.prevStep());
        document.getElementById('step2-next').addEventListener('click', () => this.nextStep());
        document.getElementById('step3-prev').addEventListener('click', () => this.prevStep());
        
        // Form submission
        document.getElementById('create-project-btn').addEventListener('click', () => this.createProject());
        
        // Project actions
        document.getElementById('edit-project-btn').addEventListener('click', () => this.editProject());
        document.getElementById('download-structure-btn').addEventListener('click', () => this.downloadStructure());
        document.getElementById('create-another-btn').addEventListener('click', () => this.createAnother());
        
        // Client management
        document.getElementById('view-clients-btn').addEventListener('click', () => this.showClientsModal());
        document.getElementById('add-client-btn').addEventListener('click', () => this.showAddClientForm());
        document.getElementById('save-client-btn').addEventListener('click', () => this.saveClient());
        document.getElementById('close-clients-modal').addEventListener('click', () => this.closeClientsModal());
        
        // Help
        document.getElementById('help-btn').addEventListener('click', () => this.showHelpModal());
        document.getElementById('close-help-modal').addEventListener('click', () => this.closeHelpModal());
        
        // Form changes
        document.querySelector('input[name="work-type"]').addEventListener('change', (e) => this.handleWorkTypeChange(e));
        document.getElementById('use-camera-folders').addEventListener('change', (e) => this.handleCameraFoldersChange(e));
        document.getElementById('add-camera-btn').addEventListener('click', () => this.addCameraAssignment());
        
        // Client input
        document.getElementById('client-name').addEventListener('input', (e) => this.handleClientInput(e));
        
        // Modal backdrop clicks
        document.getElementById('clients-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeClientsModal();
        });
        document.getElementById('help-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeHelpModal();
        });
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
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const requiredFields = currentStepElement.querySelectorAll('input[required], select[required]');
        
        let isValid = true;
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        return isValid;
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
    createProject() {
        const formData = new FormData(document.getElementById('project-form'));
        const config = this.buildProjectConfig(formData);
        
        // Validate configuration
        const validation = this.generator.validateConfig(config);
        if (!validation.isValid) {
            alert('Please fix the following errors:\n' + validation.errors.join('\n'));
            return;
        }
        
        // Show loading
        document.getElementById('loading-overlay').classList.add('active');
        
        // Simulate processing time
        setTimeout(() => {
            this.currentProject = this.generator.generateStructure(config);
            this.showProjectPreview();
            document.getElementById('loading-overlay').classList.remove('active');
        }, 1500);
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
        if (!this.currentProject) return;
        
        const zip = new JSZip();
        
        // Add all folders
        this.currentProject.folders.forEach(folder => {
            zip.folder(folder);
        });
        
        // Add all files
        this.currentProject.files.forEach(file => {
            zip.file(file.path, file.content);
        });
        
        // Generate and download
        try {
            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentProject.summary.projectName}-structure.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating download:', error);
            alert('Error generating download. Please try again.');
        }
    }

    // Utility Methods
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('project-date').value = today;
    }

    loadClients() {
        try {
            return JSON.parse(localStorage.getItem('creative-structure-clients') || '[]');
        } catch {
            return [];
        }
    }

    saveClients() {
        localStorage.setItem('creative-structure-clients', JSON.stringify(this.clients));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CreativeStructureApp();
}); 