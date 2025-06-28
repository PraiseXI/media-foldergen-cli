// Demo state management
let demoState = {
    currentStep: 0,
    projectType: '',
    workType: '',
    clientName: '',
    projectName: '',
    projectDate: '',
    includeCapture: false,
    includeProxies: false,
    cameras: [],
    isSmartPath: false,
    discoveredClients: ['ABC Corp', 'XYZ Studios', 'Creative Agency']
};

// Demo steps configuration
const demoSteps = [
    {
        id: 'smart-detection',
        title: '🔍 Smart Path Detection',
        description: 'First, let\'s simulate being in an existing folder structure',
        terminalOutput: `
<div class="smart-detection">🔍 Smart Path Detection:</div>
<div class="info">   Current directory: /Users/demo/Projects/PHOTO/Client Work</div>
<div class="info">   📁 Detected type: Photo</div>
<div class="info">   💼 Detected work type: Client</div>
<div class="client-discovery">   📁 Found client folders: ABC Corp, XYZ Studios, Creative Agency</div>
<div class="info">   ⚡ Will skip creating: photography, client_work</div>
`,
        question: 'Use smart path detection? (Skip creating folders that already exist in path)',
        choices: [
            { text: '✅ Yes - Use smart detection', value: true },
            { text: '📍 No - Create full structure', value: false }
        ],
        onAnswer: (answer) => {
            demoState.isSmartPath = answer;
            addTerminalLine(answer ? '✅ Using smart path detection' : '📍 Will use standard folder creation');
        }
    },
    {
        id: 'project-type',
        title: '📁 Project Type Selection',
        description: 'Choose what type of project you\'re creating',
        question: 'What type of project are you creating?',
        choices: [
            { text: '📸 Photo', value: 'photo' },
            { text: '🎥 Video', value: 'video' },
            { text: '📸🎥 Both (Photo + Video)', value: 'both' }
        ],
        onAnswer: (answer) => {
            demoState.projectType = answer;
            addTerminalLine(`Selected: ${answer}`);
        }
    },
    {
        id: 'work-type',
        title: '💼 Work Type Selection',
        description: 'Specify if this is client work or personal work',
        question: 'Is this client work or personal work?',
        choices: [
            { text: '👥 Client Work', value: 'client' },
            { text: '🎨 Personal Work', value: 'personal' }
        ],
        onAnswer: (answer) => {
            demoState.workType = answer;
            addTerminalLine(`Selected: ${answer}`);
        }
    },
    {
        id: 'client-selection',
        title: '👥 Client Selection',
        description: 'Choose from discovered clients or add a new one',
        question: 'Select a client:',
        terminalOutput: `<div class="client-discovery">💡 Found 3 existing client folders: ABC Corp, XYZ Studios, Creative Agency</div>`,
        choices: [
            { text: '📁 ABC Corp (from folders)', value: 'ABC Corp' },
            { text: '📁 XYZ Studios (from folders)', value: 'XYZ Studios' },
            { text: '📁 Creative Agency (from folders)', value: 'Creative Agency' },
            { text: '➕ Add New Client', value: 'new' }
        ],
        condition: () => demoState.workType === 'client',
        onAnswer: (answer) => {
            if (answer === 'new') {
                demoState.clientName = 'Demo Client';
                addTerminalLine('Enter new client name: Demo Client');
            } else {
                demoState.clientName = answer;
                addTerminalLine(`Selected: ${answer}`);
            }
        }
    },
    {
        id: 'project-name',
        title: '📝 Project Name',
        description: 'Enter a name for your project',
        question: 'Enter project name:',
        inputType: 'text',
        placeholder: 'e.g., Product Shoot, Wedding, Commercial',
        onAnswer: (answer) => {
            demoState.projectName = answer || 'Demo Project';
            addTerminalLine(`Project name: ${demoState.projectName}`);
        }
    },
    {
        id: 'project-date',
        title: '📅 Project Date',
        description: 'Choose the project date',
        question: 'Use today\'s date?',
        choices: [
            { text: '✅ Yes - Use today', value: true },
            { text: '📅 No - Choose date', value: false }
        ],
        onAnswer: (answer) => {
            demoState.projectDate = answer ? new Date().toISOString().split('T')[0] : '2024-03-15';
            addTerminalLine(`Project date: ${demoState.projectDate}`);
        }
    },
    {
        id: 'optional-settings',
        title: '⚙️ Optional Settings',
        description: 'Configure additional options for your project',
        question: 'Additional options:',
        multiSelect: true,
        choices: [
            { text: '📸 Include Capture One folder', value: 'capture', condition: () => ['photo', 'both'].includes(demoState.projectType) },
            { text: '🎥 Include Proxies folder', value: 'proxies', condition: () => ['video', 'both'].includes(demoState.projectType) },
            { text: '📹 Multi-camera setup', value: 'cameras', condition: () => ['video', 'both'].includes(demoState.projectType) }
        ],
        onAnswer: (answers) => {
            demoState.includeCapture = answers.includes('capture');
            demoState.includeProxies = answers.includes('proxies');
            const useCamera = answers.includes('cameras');
            
            if (useCamera) {
                demoState.cameras = [
                    { purpose: 'main', camera: 'Lumix' },
                    { purpose: 'BTS', camera: 'DJI POCKET' }
                ];
                addTerminalLine('📹 Camera setup: main-lumix, BTS-DJI-POCKET');
            }
            
            addTerminalLine(`Options: ${answers.join(', ') || 'none'}`);
        }
    },
    {
        id: 'confirmation',
        title: '✅ Confirmation',
        description: 'Review your project configuration',
        showPreview: true,
        question: 'Create this project structure?',
        choices: [
            { text: '✅ Create Project', value: true },
            { text: '❌ Cancel', value: false }
        ],
        onAnswer: (answer) => {
            if (answer) {
                addTerminalLine('<div class="success">✅ Successfully created project!</div>');
                addTerminalLine('<div class="success">📁 Created 8 folders</div>');
                setTimeout(() => {
                    showFolderPreview();
                }, 1000);
            } else {
                addTerminalLine('Project creation cancelled.');
            }
        }
    }
];

// Utility functions
function addTerminalLine(content, className = '') {
    const terminalContent = document.getElementById('terminal-content');
    const line = document.createElement('div');
    line.className = `output ${className}`;
    line.innerHTML = content;
    terminalContent.appendChild(line);
    terminalContent.scrollTop = terminalContent.scrollHeight;
}

function typeText(element, text, speed = 50) {
    return new Promise(resolve => {
        let i = 0;
        element.textContent = '';
        element.classList.add('typing');
        
        const timer = setInterval(() => {
            element.textContent += text[i];
            i++;
            
            if (i >= text.length) {
                clearInterval(timer);
                element.classList.remove('typing');
                resolve();
            }
        }, speed);
    });
}

function showStep(stepIndex) {
    // Hide all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    const step = demoSteps[stepIndex];
    if (!step) return;
    
    // Check condition
    if (step.condition && !step.condition()) {
        nextStep();
        return;
    }
    
    // Create step HTML
    const stepHtml = createStepHtml(step, stepIndex);
    const stepsContainer = document.getElementById('steps-container');
    stepsContainer.innerHTML = stepHtml;
    
    // Add terminal output if specified
    if (step.terminalOutput) {
        addTerminalLine(step.terminalOutput);
    }
    
    // Focus on input if it's a text input
    if (step.inputType === 'text') {
        setTimeout(() => {
            const input = document.querySelector('.text-input');
            if (input) input.focus();
        }, 100);
    }
}

function createStepHtml(step, stepIndex) {
    let html = `
        <div class="step active">
            <h3>${step.title}</h3>
            <p>${step.description}</p>
    `;
    
    if (step.showPreview) {
        html += generateProjectSummary();
    }
    
    if (step.question) {
        html += `<div class="question">❓ ${step.question}</div>`;
        
        if (step.inputType === 'text') {
            html += `
                <div class="input-group">
                    <input type="text" class="text-input" placeholder="${step.placeholder || ''}" 
                           onkeypress="handleTextInput(event, ${stepIndex})">
                    <button class="btn-primary" onclick="handleTextSubmit(${stepIndex})">Continue</button>
                </div>
            `;
        } else if (step.choices) {
            html += '<div class="choices">';
            step.choices.forEach((choice, index) => {
                if (!choice.condition || choice.condition()) {
                    const isMultiSelect = step.multiSelect ? 'data-multi="true"' : '';
                    html += `
                        <button class="btn-secondary choice-btn" 
                                ${isMultiSelect}
                                onclick="handleChoice('${choice.value}', ${stepIndex}, ${step.multiSelect || false})">
                            ${choice.text}
                        </button>
                    `;
                }
            });
            html += '</div>';
            
            if (step.multiSelect) {
                html += '<button class="btn-primary" onclick="handleMultiSelectSubmit(' + stepIndex + ')">Continue</button>';
            }
        }
    }
    
    html += '</div>';
    return html;
}

function generateProjectSummary() {
    const dateStr = new Date(demoState.projectDate).toLocaleDateString();
    const folderName = demoState.workType === 'client' 
        ? `${demoState.projectDate}-${demoState.projectName}`
        : demoState.projectName;
    
    return `
        <div class="project-summary">
            <h4>📋 Project Summary:</h4>
            <ul>
                <li><strong>Type:</strong> ${demoState.projectType}</li>
                <li><strong>Work Type:</strong> ${demoState.workType}</li>
                ${demoState.clientName ? `<li><strong>Client:</strong> ${demoState.clientName}</li>` : ''}
                <li><strong>Project:</strong> ${demoState.projectName}</li>
                <li><strong>Date:</strong> ${dateStr}</li>
                <li><strong>Folder Name:</strong> ${folderName}</li>
                ${demoState.includeCapture ? '<li><strong>Capture One:</strong> Included</li>' : ''}
                ${demoState.includeProxies ? '<li><strong>Proxies:</strong> Included</li>' : ''}
                ${demoState.cameras.length ? `<li><strong>Cameras:</strong> ${demoState.cameras.map(c => `${c.purpose}-${c.camera}`).join(', ')}</li>` : ''}
            </ul>
        </div>
    `;
}

function handleChoice(value, stepIndex, isMultiSelect = false) {
    if (isMultiSelect) {
        // Toggle selection for multi-select
        const btn = event.target;
        btn.classList.toggle('selected');
        return;
    }
    
    // Single select - proceed immediately
    const step = demoSteps[stepIndex];
    if (step.onAnswer) {
        step.onAnswer(value);
    }
    
    setTimeout(() => {
        nextStep();
    }, 500);
}

function handleMultiSelectSubmit(stepIndex) {
    const selectedBtns = document.querySelectorAll('.choice-btn.selected');
    const selectedValues = Array.from(selectedBtns).map(btn => {
        const text = btn.textContent.trim();
        // Extract value from the text
        if (text.includes('Capture One')) return 'capture';
        if (text.includes('Proxies')) return 'proxies';
        if (text.includes('Multi-camera')) return 'cameras';
        return btn.onclick.toString().match(/'([^']+)'/)[1];
    });
    
    const step = demoSteps[stepIndex];
    if (step.onAnswer) {
        step.onAnswer(selectedValues);
    }
    
    setTimeout(() => {
        nextStep();
    }, 500);
}

function handleTextInput(event, stepIndex) {
    if (event.key === 'Enter') {
        handleTextSubmit(stepIndex);
    }
}

function handleTextSubmit(stepIndex) {
    const input = document.querySelector('.text-input');
    const value = input.value.trim();
    
    const step = demoSteps[stepIndex];
    if (step.onAnswer) {
        step.onAnswer(value);
    }
    
    setTimeout(() => {
        nextStep();
    }, 500);
}

function nextStep() {
    demoState.currentStep++;
    if (demoState.currentStep < demoSteps.length) {
        showStep(demoState.currentStep);
    }
}

function startDemo() {
    // Clear terminal and start
    const terminalContent = document.getElementById('terminal-content');
    terminalContent.innerHTML = `
        <div class="line">
            <span class="prompt">$</span>
            <span class="command">creative-structure-cli interactive</span>
        </div>
        <div class="output">
            <div class="banner">
                ┌────────────────────────────────────────────────┐<br>
                │  🎬 Creative Structure CLI - Interactive Mode │<br>
                └────────────────────────────────────────────────┘
            </div>
        </div>
    `;
    
    demoState.currentStep = 0;
    setTimeout(() => {
        showStep(0);
    }, 500);
}

function generateFolderStructure() {
    const baseStructure = {
        folders: [],
        files: ['README.md']
    };
    
    const projectFolder = demoState.workType === 'client' 
        ? `${demoState.projectDate}-${demoState.projectName}`
        : demoState.projectName;
    
    if (demoState.projectType === 'photo' || demoState.projectType === 'both') {
        const photoStructure = {
            'RAW': {},
            'Edited': {},
            'Deliverables': {},
            'Contracts & Briefs': {},
            'Exports for Social-Print': {}
        };
        
        if (demoState.includeCapture) {
            photoStructure['Capture One'] = {};
        }
        
        baseStructure.folders.push({
            name: 'PHOTO',
            children: {
                [demoState.workType === 'client' ? 'Client Work' : 'Personal Work']: {
                    [demoState.workType === 'client' ? demoState.clientName : new Date().getFullYear().toString()]: {
                        [projectFolder]: photoStructure
                    }
                }
            }
        });
    }
    
    if (demoState.projectType === 'video' || demoState.projectType === 'both') {
        const videoStructure = {
            'Footage': {
                'RAW': {}
            },
            'Edited': {},
            'Deliverables': {},
            'Contracts & Briefs': {},
            'Exports': {},
            'Thumbnail & Graphics': {},
            'Audio': {}
        };
        
        // Add camera folders
        if (demoState.cameras.length > 0) {
            demoState.cameras.forEach(cam => {
                const folderName = `${cam.purpose}-${cam.camera.toLowerCase()}`;
                videoStructure.Footage.RAW[folderName] = {};
            });
        }
        
        if (demoState.includeProxies) {
            videoStructure.Footage.Proxies = {};
            if (demoState.cameras.length > 0) {
                demoState.cameras.forEach(cam => {
                    const folderName = `${cam.purpose}-${cam.camera.toLowerCase()}`;
                    videoStructure.Footage.Proxies[folderName] = {};
                });
            }
        }
        
        baseStructure.folders.push({
            name: 'VIDEO',
            children: {
                [demoState.workType === 'client' ? 'Client Work' : 'Personal Work']: {
                    [demoState.workType === 'client' ? demoState.clientName : new Date().getFullYear().toString()]: {
                        [projectFolder]: videoStructure
                    }
                }
            }
        });
    }
    
    return baseStructure;
}

function showFolderPreview() {
    const structure = generateFolderStructure();
    const treeText = generateTreeText(structure);
    
    document.getElementById('folder-tree').textContent = treeText;
    document.getElementById('preview-container').style.display = 'block';
    
    // Scroll to preview
    document.getElementById('preview-container').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

function generateTreeText(structure, prefix = '', isLast = true) {
    let result = '';
    
    if (structure.folders) {
        structure.folders.forEach((folder, index) => {
            const isLastFolder = index === structure.folders.length - 1 && !structure.files;
            result += `${prefix}${isLastFolder ? '└── ' : '├── '}${folder.name}/\n`;
            
            if (folder.children) {
                const newPrefix = prefix + (isLastFolder ? '    ' : '│   ');
                result += generateTreeFromObject(folder.children, newPrefix);
            }
        });
    }
    
    if (structure.files) {
        structure.files.forEach((file, index) => {
            const isLastFile = index === structure.files.length - 1;
            result += `${prefix}${isLastFile ? '└── ' : '├── '}${file}\n`;
        });
    }
    
    return result;
}

function generateTreeFromObject(obj, prefix = '') {
    let result = '';
    const entries = Object.entries(obj);
    
    entries.forEach(([key, value], index) => {
        const isLast = index === entries.length - 1;
        result += `${prefix}${isLast ? '└── ' : '├── '}${key}/\n`;
        
        if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            result += generateTreeFromObject(value, newPrefix);
        }
    });
    
    return result;
}

async function downloadStructure() {
    const zip = new JSZip();
    const structure = generateFolderStructure();
    
    // Add README with project info
    const readme = `# ${demoState.projectName}

Project Type: ${demoState.projectType}
Work Type: ${demoState.workType}
${demoState.clientName ? `Client: ${demoState.clientName}` : ''}
Date: ${demoState.projectDate}

Generated by Creative Structure CLI
https://github.com/your-repo/creative-structure-cli

## Folder Structure

This folder structure follows industry best practices for ${demoState.projectType} projects.

${demoState.cameras.length > 0 ? `
## Camera Setup
${demoState.cameras.map(c => `- ${c.purpose}: ${c.camera}`).join('\n')}
` : ''}

Happy creating! 📸🎥
`;
    
    zip.file('README.md', readme);
    
    // Add folder structure
    addFoldersToZip(zip, structure.folders);
    
    // Generate and download
    try {
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${demoState.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_structure.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show success message
        addTerminalLine('<div class="success">📦 Folder structure downloaded successfully!</div>');
    } catch (error) {
        console.error('Download failed:', error);
        addTerminalLine('<div class="error">❌ Download failed. Please try again.</div>');
    }
}

function addFoldersToZip(zip, folders, basePath = '') {
    folders.forEach(folder => {
        const folderPath = basePath + folder.name + '/';
        zip.folder(folderPath);
        
        if (folder.children) {
            addObjectToZip(zip, folder.children, folderPath);
        }
    });
}

function addObjectToZip(zip, obj, basePath = '') {
    Object.entries(obj).forEach(([key, value]) => {
        const path = basePath + key + '/';
        zip.folder(path);
        
        if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
            addObjectToZip(zip, value, path);
        } else {
            // Add a placeholder file to ensure empty folders are created
            zip.file(path + '.gitkeep', '# This file ensures the folder is created in git repositories\n');
        }
    });
}

// Scroll to demo section
function scrollToDemo() {
    const terminal = document.querySelector('.terminal-container');
    if (terminal) {
        terminal.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add some initial terminal content
    setTimeout(() => {
        addTerminalLine('<div class="info">💡 This is an interactive demo of the Creative Structure CLI</div>');
        addTerminalLine('<div class="info">📁 Experience how it generates professional folder structures</div>');
        addTerminalLine('<div class="info">🚀 Click "Start Demo" below to begin!</div>');
    }, 1000);
});

// Handle graceful exits and edge cases
window.addEventListener('beforeunload', function(e) {
    // Clean up any ongoing downloads or processes
    // This handles the browser limitation gracefully
});

// Prevent right-click and other browser limitations
document.addEventListener('contextmenu', function(e) {
    if (e.target.closest('.terminal')) {
        e.preventDefault();
    }
});

// Add some terminal-like keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+C simulation (graceful exit)
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        addTerminalLine('<div class="warning">^C</div>');
        addTerminalLine('<div class="info">Process interrupted. Use "Start Demo" to begin again.</div>');
        
        // Reset to initial state
        demoState.currentStep = 0;
        document.getElementById('steps-container').innerHTML = `
            <div class="step active">
                <h3>🎯 Welcome to the Interactive Demo</h3>
                <p>Experience how the CLI helps you create professional folder structures for your creative projects.</p>
                <button class="btn-primary" onclick="startDemo()">Start Demo</button>
            </div>
        `;
    }
}); 