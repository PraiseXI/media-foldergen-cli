/**
 * Creative Structure Generator
 * Core logic for generating folder structures
 */

class StructureGenerator {
    constructor() {
        this.supportedTypes = ['photo', 'video', 'both'];
        this.workTypes = ['client', 'personal'];
    }

    /**
     * Generate folder structure based on project configuration
     */
    generateStructure(config) {
        const structure = {
            folders: [],
            files: [],
            summary: this.generateSummary(config)
        };

        // Base structure varies by project type and work type
        if (config.workType === 'client') {
            this.generateClientStructure(structure, config);
        } else {
            this.generatePersonalStructure(structure, config);
        }

        return structure;
    }

    /**
     * Generate client work folder structure
     */
    generateClientStructure(structure, config) {
        const clientName = config.clientName || 'Client Name';
        const projectName = config.projectName;
        const projectDate = config.projectDate;
        
        // Format project folder name
        const formattedDate = this.formatDateForFolder(projectDate);
        const projectFolderName = `${formattedDate} ${projectName}`;
        
        const basePath = `Client Work/${clientName}/${projectFolderName}`;
        
        if (config.projectType === 'photo' || config.projectType === 'both') {
            this.addPhotoFolders(structure, basePath, config);
        }
        
        if (config.projectType === 'video' || config.projectType === 'both') {
            this.addVideoFolders(structure, basePath, config);
        }
        
        // Add common folders
        this.addCommonFolders(structure, basePath, config);
    }

    /**
     * Generate personal work folder structure
     */
    generatePersonalStructure(structure, config) {
        const projectName = config.projectName;
        const projectDate = config.projectDate;
        
        const formattedDate = this.formatDateForFolder(projectDate);
        const projectFolderName = `${formattedDate} ${projectName}`;
        
        const basePath = `Personal Work/${projectFolderName}`;
        
        if (config.projectType === 'photo' || config.projectType === 'both') {
            this.addPhotoFolders(structure, basePath, config);
        }
        
        if (config.projectType === 'video' || config.projectType === 'both') {
            this.addVideoFolders(structure, basePath, config);
        }
        
        // Add common folders
        this.addCommonFolders(structure, basePath, config);
    }

    /**
     * Add photography-specific folders
     */
    addPhotoFolders(structure, basePath, config) {
        const photoBasePath = config.projectType === 'both' ? `${basePath}/PHOTO` : basePath;
        
        // Standard photo folders
        structure.folders.push(`${photoBasePath}/RAW Images`);
        structure.folders.push(`${photoBasePath}/RAW Images/Camera 1`);
        structure.folders.push(`${photoBasePath}/Edited Images`);
        structure.folders.push(`${photoBasePath}/Edited Images/High Res`);
        structure.folders.push(`${photoBasePath}/Edited Images/Web Res`);
        structure.folders.push(`${photoBasePath}/Delivered Images`);
        structure.folders.push(`${photoBasePath}/Client Selects`);
        structure.folders.push(`${photoBasePath}/Behind the Scenes`);
        
        // Optional Capture One folder
        if (config.includeCaptureOne) {
            structure.folders.push(`${photoBasePath}/Capture One Catalog`);
        }
    }

    /**
     * Add videography-specific folders
     */
    addVideoFolders(structure, basePath, config) {
        const videoBasePath = config.projectType === 'both' ? `${basePath}/VIDEO` : basePath;
        
        // Standard video folders
        structure.folders.push(`${videoBasePath}/RAW Footage`);
        structure.folders.push(`${videoBasePath}/Edited Footage`);
        structure.folders.push(`${videoBasePath}/Delivered Videos`);
        structure.folders.push(`${videoBasePath}/Project Files`);
        structure.folders.push(`${videoBasePath}/Audio Files`);
        structure.folders.push(`${videoBasePath}/Graphics & Assets`);
        structure.folders.push(`${videoBasePath}/Behind the Scenes`);
        
        // Optional Proxies folder
        if (config.includeProxies) {
            structure.folders.push(`${videoBasePath}/Proxies`);
        }
        
        // Camera-specific folders if enabled
        if (config.useCameraFolders && config.cameraAssignments) {
            this.addCameraFolders(structure, videoBasePath, config.cameraAssignments);
        } else {
            // Default camera folders
            structure.folders.push(`${videoBasePath}/RAW Footage/Camera 1`);
        }
    }

    /**
     * Add camera-specific folders for multi-camera setups
     */
    addCameraFolders(structure, basePath, cameraAssignments) {
        cameraAssignments.forEach((assignment, index) => {
            const cameraName = assignment.name || `Camera ${index + 1}`;
            const cameraFolder = assignment.folder || `Camera ${index + 1}`;
            
            structure.folders.push(`${basePath}/RAW Footage/${cameraFolder}`);
            
            // Add role-specific subfolders if specified
            if (assignment.role && assignment.role !== 'main') {
                const roleFolder = this.formatRoleFolder(assignment.role);
                structure.folders.push(`${basePath}/RAW Footage/${cameraFolder}/${roleFolder}`);
            }
        });
    }

    /**
     * Add common folders that apply to all project types
     */
    addCommonFolders(structure, basePath, config) {
        structure.folders.push(`${basePath}/Client Communication`);
        structure.folders.push(`${basePath}/Contracts & Invoices`);
        structure.folders.push(`${basePath}/Reference & Inspiration`);
        
        // Add README file
        structure.files.push({
            path: `${basePath}/README.txt`,
            content: this.generateReadmeContent(config)
        });
    }

    /**
     * Format date for folder naming (YYYY-MM-DD)
     */
    formatDateForFolder(dateString) {
        if (!dateString) return new Date().toISOString().split('T')[0];
        return dateString;
    }

    /**
     * Format camera role for folder naming
     */
    formatRoleFolder(role) {
        const roleMap = {
            'wide': 'Wide Shots',
            'close': 'Close Ups',
            'detail': 'Detail Shots',
            'bts': 'Behind the Scenes',
            'drone': 'Drone Footage',
            'interview': 'Interview',
            'broll': 'B-Roll'
        };
        return roleMap[role] || role;
    }

    /**
     * Generate README content for the project
     */
    generateReadmeContent(config) {
        const content = [
            `Project: ${config.projectName}`,
            `Date: ${config.projectDate}`,
            `Type: ${config.projectType.toUpperCase()}`,
            `Work Type: ${config.workType === 'client' ? 'Client Work' : 'Personal Work'}`,
        ];

        if (config.workType === 'client' && config.clientName) {
            content.push(`Client: ${config.clientName}`);
        }

        content.push('');
        content.push('Generated by Creative Structure');
        content.push('https://creative-structure.vercel.app/');

        return content.join('\n');
    }

    /**
     * Generate project summary for display
     */
    generateSummary(config) {
        const summary = {
            projectName: config.projectName,
            projectType: this.formatProjectType(config.projectType),
            workType: this.formatWorkType(config.workType),
            projectDate: this.formatDateForDisplay(config.projectDate),
        };

        if (config.workType === 'client' && config.clientName) {
            summary.clientName = config.clientName;
        }

        return summary;
    }

    /**
     * Format project type for display
     */
    formatProjectType(type) {
        const typeMap = {
            'photo': 'Photography',
            'video': 'Videography',
            'both': 'Photo + Video'
        };
        return typeMap[type] || type;
    }

    /**
     * Format work type for display
     */
    formatWorkType(type) {
        const typeMap = {
            'client': 'Client Work',
            'personal': 'Personal Work'
        };
        return typeMap[type] || type;
    }

    /**
     * Format date for display
     */
    formatDateForDisplay(dateString) {
        if (!dateString) return 'Not specified';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Generate folder tree visualization
     */
    generateFolderTree(structure) {
        const folders = [...structure.folders].sort();
        const tree = [];
        const processedPaths = new Set();

        folders.forEach(folder => {
            const parts = folder.split('/');
            let currentPath = '';

            parts.forEach((part, index) => {
                const previousPath = currentPath;
                currentPath = currentPath ? `${currentPath}/${part}` : part;

                if (!processedPaths.has(currentPath)) {
                    const indent = '  '.repeat(index);
                    const icon = index === parts.length - 1 ? '📁' : '📂';
                    tree.push(`${indent}${icon} ${part}`);
                    processedPaths.add(currentPath);
                }
            });
        });

        // Add files
        structure.files.forEach(file => {
            const parts = file.path.split('/');
            const fileName = parts[parts.length - 1];
            const indent = '  '.repeat(parts.length - 1);
            tree.push(`${indent}📄 ${fileName}`);
        });

        return tree.join('\n');
    }

    /**
     * Validate project configuration
     */
    validateConfig(config) {
        const errors = [];

        if (!config.projectType || !this.supportedTypes.includes(config.projectType)) {
            errors.push('Valid project type is required');
        }

        if (!config.workType || !this.workTypes.includes(config.workType)) {
            errors.push('Valid work type is required');
        }

        if (!config.projectName || config.projectName.trim().length === 0) {
            errors.push('Project name is required');
        }

        if (!config.projectDate) {
            errors.push('Project date is required');
        }

        if (config.workType === 'client' && (!config.clientName || config.clientName.trim().length === 0)) {
            errors.push('Client name is required for client work');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StructureGenerator;
} else {
    window.StructureGenerator = StructureGenerator;
} 