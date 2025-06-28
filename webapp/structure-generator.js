/**
 * Creative Structure Generator
 * Handles folder structure generation for photo and video projects
 */

class StructureGenerator {
    constructor() {
        this.templates = {
            photo: {
                client: [
                    'RAW',
                    'Edited',
                    'Deliverables',
                    'Contracts & Briefs',
                    'Exports for Social-Print'
                ],
                personal: [
                    'RAW',
                    'Edited',
                    'Exports for Social-Print'
                ]
            },
            video: {
                client: [
                    'Footage',
                    'Footage/RAW',
                    'Edited',
                    'Deliverables',
                    'Contracts & Briefs',
                    'Exports',
                    'Thumbnail & Graphics',
                    'Audio'
                ],
                personal: [
                    'Footage',
                    'Edited',
                    'Exports',
                    'Audio'
                ]
            }
        };

        this.cameraPurposes = [
            'main',
            'BTS',
            'secondary',
            'drone',
            'interview',
            'detail',
            'backup'
        ];
    }

    /**
     * Generate project structure based on configuration
     * @param {Object} config - Project configuration
     * @returns {Object} - Generated structure with paths and files
     */
    generateStructure(config) {
        const structure = {
            paths: [],
            summary: this.generateSummary(config),
            preview: ''
        };

        // Determine project types to create
        const typesToCreate = this.getProjectTypes(config.projectType);
        
        for (const type of typesToCreate) {
            const typeStructure = this.generateTypeStructure(type, config);
            structure.paths.push(...typeStructure.paths);
        }

        // Generate preview text
        structure.preview = this.generatePreviewText(structure.paths);
        
        return structure;
    }

    /**
     * Get project types to create based on selection
     * @param {string} projectType - Selected project type
     * @returns {Array} - Array of types to create
     */
    getProjectTypes(projectType) {
        switch (projectType) {
            case 'photo':
                return ['PHOTO'];
            case 'video':
                return ['VIDEO'];
            case 'both':
                return ['PHOTO', 'VIDEO'];
            default:
                return ['PHOTO'];
        }
    }

    /**
     * Generate structure for a specific project type
     * @param {string} type - Project type (PHOTO/VIDEO)
     * @param {Object} config - Project configuration
     * @returns {Object} - Type-specific structure
     */
    generateTypeStructure(type, config) {
        const structure = { paths: [] };
        const baseType = type.toLowerCase() === 'photo' ? 'photo' : 'video';
        
        // Build base path
        let basePath = type;
        
        // Add work type folder
        if (config.workType === 'client') {
            basePath += '/Client Work';
            
            // Add client folder
            if (config.clientName) {
                basePath += `/${config.clientName}`;
            }
        } else {
            basePath += '/Personal Work';
            
            // Add year folder for personal work
            const year = new Date(config.projectDate).getFullYear();
            basePath += `/${year}`;
        }

        // Add project folder
        const projectFolder = this.formatProjectName(config.projectName, config.projectDate, config.workType);
        basePath += `/${projectFolder}`;

        // Get template folders
        const templateFolders = this.templates[baseType][config.workType] || [];
        
        // Create folder structure
        for (const folder of templateFolders) {
            const fullPath = `${basePath}/${folder}`;
            structure.paths.push(fullPath);

            // Add camera folders for video projects
            if (folder === 'Footage/RAW' || folder === 'Footage/Proxies') {
                this.addCameraFolders(structure, fullPath, config);
            }
        }

        // Add optional folders
        this.addOptionalFolders(structure, basePath, baseType, config);

        return structure;
    }

    /**
     * Add camera-specific folders for video projects
     * @param {Object} structure - Structure object to modify
     * @param {string} basePath - Base path for camera folders
     * @param {Object} config - Project configuration
     */
    addCameraFolders(structure, basePath, config) {
        if (config.useCameraFolders && config.cameraAssignments && config.cameraAssignments.length > 0) {
            for (const assignment of config.cameraAssignments) {
                const cameraFolder = `${assignment.purpose}-${assignment.camera}`;
                structure.paths.push(`${basePath}/${cameraFolder}`);
            }
        }
    }

    /**
     * Add optional folders based on configuration
     * @param {Object} structure - Structure object to modify
     * @param {string} basePath - Base path
     * @param {string} type - Project type
     * @param {Object} config - Project configuration
     */
    addOptionalFolders(structure, basePath, type, config) {
        // Add Capture One folder for photo projects
        if (type === 'photo' && config.includeCaptureOne) {
            structure.paths.push(`${basePath}/Capture One`);
        }

        // Add Proxies folder for video projects
        if (type === 'video' && config.includeProxies) {
            // Check if Proxies folder already exists from template
            const proxiesPath = `${basePath}/Footage/Proxies`;
            if (!structure.paths.some(path => path.startsWith(proxiesPath))) {
                structure.paths.push(proxiesPath);
                this.addCameraFolders(structure, proxiesPath, config);
            }
        }
    }

    /**
     * Format project name with date
     * @param {string} projectName - Project name
     * @param {string} projectDate - Project date
     * @param {string} workType - Work type
     * @returns {string} - Formatted project name
     */
    formatProjectName(projectName, projectDate, workType) {
        if (workType === 'client') {
            const date = new Date(projectDate);
            const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
            return `${formattedDate}-${projectName}`;
        }
        return projectName;
    }

    /**
     * Generate project summary
     * @param {Object} config - Project configuration
     * @returns {Object} - Project summary
     */
    generateSummary(config) {
        const summary = {
            projectType: this.formatProjectType(config.projectType),
            workType: config.workType === 'client' ? 'Client Work' : 'Personal Work',
            projectName: config.projectName,
            projectDate: new Date(config.projectDate).toLocaleDateString(),
            clientName: config.clientName || 'N/A',
            features: []
        };

        // Add features
        if (config.includeCaptureOne) {
            summary.features.push('Capture One folder');
        }
        if (config.includeProxies) {
            summary.features.push('Proxies folder');
        }
        if (config.useCameraFolders && config.cameraAssignments?.length > 0) {
            summary.features.push(`${config.cameraAssignments.length} camera setup`);
        }

        return summary;
    }

    /**
     * Format project type for display
     * @param {string} projectType - Project type
     * @returns {string} - Formatted project type
     */
    formatProjectType(projectType) {
        switch (projectType) {
            case 'photo':
                return 'Photography';
            case 'video':
                return 'Videography';
            case 'both':
                return 'Photo & Video';
            default:
                return projectType;
        }
    }

    /**
     * Generate preview text from paths
     * @param {Array} paths - Array of folder paths
     * @returns {string} - Preview text
     */
    generatePreviewText(paths) {
        if (paths.length === 0) return 'No folders to create';

        // Sort paths to show hierarchy correctly
        const sortedPaths = [...paths].sort();
        
        // Group by root folder
        const groups = {};
        sortedPaths.forEach(path => {
            const parts = path.split('/');
            const root = parts[0];
            if (!groups[root]) {
                groups[root] = [];
            }
            groups[root].push(path);
        });

        let preview = '';
        for (const [root, rootPaths] of Object.entries(groups)) {
            preview += this.generateTreeStructure(rootPaths, root);
            preview += '\n';
        }

        return preview.trim();
    }

    /**
     * Generate tree structure text
     * @param {Array} paths - Paths for this tree
     * @param {string} root - Root folder name
     * @returns {string} - Tree structure text
     */
    generateTreeStructure(paths, root) {
        const tree = {};
        
        // Build tree structure
        paths.forEach(path => {
            const parts = path.split('/');
            let current = tree;
            
            parts.forEach(part => {
                if (!current[part]) {
                    current[part] = {};
                }
                current = current[part];
            });
        });

        // Generate text representation
        let result = '';
        this.renderTree(tree, '', result, true);
        return result;
    }

    /**
     * Render tree structure recursively
     * @param {Object} node - Current tree node
     * @param {string} prefix - Current prefix for indentation
     * @param {string} result - Result string (passed by reference)
     * @param {boolean} isRoot - Whether this is the root level
     */
    renderTree(node, prefix, result, isRoot = false) {
        const keys = Object.keys(node).sort();
        
        keys.forEach((key, index) => {
            const isLast = index === keys.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const icon = Object.keys(node[key]).length > 0 ? '📁 ' : '📄 ';
            
            if (isRoot && index === 0) {
                result += `${icon}${key}/\n`;
            } else {
                result += `${prefix}${connector}${icon}${key}${Object.keys(node[key]).length > 0 ? '/' : ''}\n`;
            }
            
            if (Object.keys(node[key]).length > 0) {
                const newPrefix = isRoot && index === 0 ? '' : prefix + (isLast ? '    ' : '│   ');
                this.renderTree(node[key], newPrefix, result);
            }
        });
        
        return result;
    }

    /**
     * Create ZIP file with folder structure
     * @param {Object} structure - Generated structure
     * @param {string} projectName - Project name for ZIP filename
     * @returns {Promise<Blob>} - ZIP file blob
     */
    async createZipFile(structure, projectName) {
        const zip = new JSZip();
        
        // Add folders to ZIP
        structure.paths.forEach(path => {
            // Create folder by adding empty file
            zip.file(`${path}/.gitkeep`, '# This file maintains the folder structure\n# You can delete this file after adding your own files');
        });

        // Add README file
        const readmeContent = this.generateReadmeContent(structure);
        zip.file('README.md', readmeContent);

        // Generate ZIP
        const blob = await zip.generateAsync({ type: 'blob' });
        return blob;
    }

    /**
     * Generate README content for the project
     * @param {Object} structure - Generated structure
     * @returns {string} - README content
     */
    generateReadmeContent(structure) {
        const { summary } = structure;
        
        return `# ${summary.projectName}

## Project Information
- **Type**: ${summary.projectType}
- **Work Type**: ${summary.workType}
- **Date**: ${summary.projectDate}
- **Client**: ${summary.clientName}

## Features
${summary.features.length > 0 ? summary.features.map(f => `- ${f}`).join('\n') : '- Standard folder structure'}

## Folder Structure

\`\`\`
${structure.preview}
\`\`\`

## Usage Notes

1. Replace the \`.gitkeep\` files with your actual project files
2. Maintain the folder structure for consistency
3. Follow your team's naming conventions for files

---

Generated by Creative Structure Web App
Visit: [Creative Structure](https://github.com/your-repo/creative-structure-cli)
`;
    }

    /**
     * Download ZIP file
     * @param {Blob} blob - ZIP file blob
     * @param {string} filename - Filename for download
     */
    downloadZip(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Validate project configuration
     * @param {Object} config - Project configuration
     * @returns {Object} - Validation result
     */
    validateConfig(config) {
        const errors = [];
        
        if (!config.projectType) {
            errors.push('Project type is required');
        }
        
        if (!config.workType) {
            errors.push('Work type is required');
        }
        
        if (!config.projectName) {
            errors.push('Project name is required');
        }
        
        if (!config.projectDate) {
            errors.push('Project date is required');
        }
        
        if (config.workType === 'client' && !config.clientName) {
            errors.push('Client name is required for client work');
        }

        if (config.useCameraFolders && (!config.cameraAssignments || config.cameraAssignments.length === 0)) {
            errors.push('At least one camera assignment is required when using camera folders');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Export for use in main app
window.StructureGenerator = StructureGenerator; 