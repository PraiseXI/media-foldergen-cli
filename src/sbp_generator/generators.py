"""
Folder structure generators for the SBP Folder Generator CLI.
"""

import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from .models import ProjectConfig, ProjectType, WorkType, FolderStructure
from .config import config_manager
from .client_manager import client_manager


class ProjectGenerator:
    """Generates folder structures for projects."""
    
    def __init__(self):
        self.config = config_manager.config
        self.templates_dir = Path(__file__).parent / "templates"
    
    def analyze_current_directory(self, current_path: Path = None) -> Dict[str, Any]:
        """Analyze the current directory to see if we're already in part of the expected structure."""
        if current_path is None:
            current_path = Path.cwd()
        
        path_parts = current_path.parts
        analysis = {
            "is_in_structure": False,
            "detected_type": None,  # photography, videography, assets
            "detected_work_type": None,  # client, personal
            "detected_client": None,
            "detected_year": None,
            "discovered_clients": [],  # list of existing client folders
            "client_work_path": None,  # path to Client Work folder for discovering clients
            "suggested_base": current_path,
            "skip_folders": []
        }
        
        # Check if we're in any of the expected base directories
        for i, part in enumerate(path_parts):
            if part in [self.config.base_directories["photography"], "Photography", "PHOTO"]:
                analysis["is_in_structure"] = True
                analysis["detected_type"] = "photography"
                
                # If we're IN the PHOTO directory (it's the last part), use current path as base
                # If we're deeper in the structure, use the parent of PHOTO
                if i == len(path_parts) - 1:
                    # We're directly in the PHOTO directory
                    analysis["suggested_base"] = current_path
                else:
                    # We're deeper in the structure
                    analysis["suggested_base"] = Path(*path_parts[:i])
                
                analysis["skip_folders"].append("photography")
                
                # Check if we're deeper in the structure
                if i + 1 < len(path_parts):
                    next_part = path_parts[i + 1]
                    if next_part in [self.config.client_work_subfolder, "Client Work"]:
                        analysis["detected_work_type"] = "client"
                        analysis["skip_folders"].extend(["photography", "client_work"])
                        
                        # Store the Client Work path for discovering clients
                        client_work_path = Path(*path_parts[:i+2])
                        analysis["client_work_path"] = client_work_path
                        
                        # Discover existing clients in the Client Work folder
                        if client_work_path.exists():
                            try:
                                for item in client_work_path.iterdir():
                                    if item.is_dir() and not item.name.startswith('.'):
                                        analysis["discovered_clients"].append(item.name)
                            except (PermissionError, OSError):
                                pass  # Skip if we can't read the directory
                        
                        # Check for client name
                        if i + 2 < len(path_parts):
                            analysis["detected_client"] = path_parts[i + 2]
                            analysis["skip_folders"].append("client_folder")
                    
                    elif next_part in [self.config.personal_work_subfolder, "Personal Work"]:
                        analysis["detected_work_type"] = "personal"
                        analysis["skip_folders"].extend(["photography", "personal_work"])
                        
                        # Check for year
                        if i + 2 < len(path_parts) and path_parts[i + 2].isdigit():
                            analysis["detected_year"] = int(path_parts[i + 2])
                            analysis["skip_folders"].append("year_folder")
                
                break
                
            elif part in [self.config.base_directories["videography"], "Videography", "VIDEO"]:
                analysis["is_in_structure"] = True
                analysis["detected_type"] = "videography"
                
                # If we're IN the VIDEO directory (it's the last part), use current path as base
                # If we're deeper in the structure, use the parent of VIDEO
                if i == len(path_parts) - 1:
                    # We're directly in the VIDEO directory
                    analysis["suggested_base"] = current_path
                else:
                    # We're deeper in the structure
                    analysis["suggested_base"] = Path(*path_parts[:i])
                
                analysis["skip_folders"].append("videography")
                
                # Similar logic for videography
                if i + 1 < len(path_parts):
                    next_part = path_parts[i + 1]
                    if next_part in [self.config.client_work_subfolder, "Client Work"]:
                        analysis["detected_work_type"] = "client"
                        analysis["skip_folders"].extend(["videography", "client_work"])
                        
                        # Store the Client Work path for discovering clients
                        client_work_path = Path(*path_parts[:i+2])
                        analysis["client_work_path"] = client_work_path
                        
                        # Discover existing clients in the Client Work folder
                        if client_work_path.exists():
                            try:
                                for item in client_work_path.iterdir():
                                    if item.is_dir() and not item.name.startswith('.'):
                                        analysis["discovered_clients"].append(item.name)
                            except (PermissionError, OSError):
                                pass  # Skip if we can't read the directory
                        
                        if i + 2 < len(path_parts):
                            analysis["detected_client"] = path_parts[i + 2]
                            analysis["skip_folders"].append("client_folder")
                    
                    elif next_part in [self.config.personal_work_subfolder, "Personal Work"]:
                        analysis["detected_work_type"] = "personal"
                        analysis["skip_folders"].extend(["videography", "personal_work"])
                        
                        if i + 2 < len(path_parts) and path_parts[i + 2].isdigit():
                            analysis["detected_year"] = int(path_parts[i + 2])
                            analysis["skip_folders"].append("year_folder")
                
                break
        
        # Additional client discovery: if we're in the same level as Client Work, check for clients there too
        if analysis["is_in_structure"] and not analysis["discovered_clients"]:
            potential_client_work_paths = []
            
            # If we're directly in a PHOTO/VIDEO directory, check for Client Work subfolder
            if analysis["detected_type"]:
                # Check if Client Work exists in current directory (when we're in PHOTO/VIDEO directly)
                current_client_work = current_path / self.config.client_work_subfolder
                if not current_client_work.exists():
                    current_client_work = current_path / "Client Work"
                if current_client_work.exists():
                    potential_client_work_paths.append(current_client_work)
                
                # Also search in parent directories
                current_parent = current_path.parent
                while current_parent != current_parent.parent:  # Don't go to root
                    for type_folder in [self.config.base_directories["photography"], self.config.base_directories["videography"], "Photography", "Videography", "PHOTO", "VIDEO"]:
                        type_path = current_parent / type_folder
                        if type_path.exists():
                            client_work_path = type_path / self.config.client_work_subfolder
                            if not client_work_path.exists():
                                client_work_path = type_path / "Client Work"
                            if client_work_path.exists() and client_work_path not in potential_client_work_paths:
                                potential_client_work_paths.append(client_work_path)
                    current_parent = current_parent.parent
                    if len(str(current_parent)) < 10:  # Prevent going too high up
                        break
            
            # Discover clients from any found Client Work paths
            for client_work_path in potential_client_work_paths:
                try:
                    for item in client_work_path.iterdir():
                        if item.is_dir() and not item.name.startswith('.') and item.name not in analysis["discovered_clients"]:
                            analysis["discovered_clients"].append(item.name)
                except (PermissionError, OSError):
                    pass
        
        return analysis

    def load_template(self, template_name: str) -> Dict[str, Any]:
        """Load folder structure template from JSON file."""
        template_file = self.templates_dir / f"{template_name}.json"
        
        if not template_file.exists():
            # Return default structure if template doesn't exist
            return self._get_default_structure(template_name)
        
        with open(template_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _get_default_structure(self, template_name: str) -> Dict[str, Any]:
        """Get default folder structure if template file doesn't exist."""
        if template_name == "photography_client":
            return {
                "folders": [
                    "RAW",
                    "Edited", 
                    "Deliverables",
                    "Contracts & Briefs",
                    "Exports for Social-Print"
                ],
                "optional_folders": [
                    "Capture One"
                ]
            }
        elif template_name == "photography_personal":
            return {
                "folders": [
                    "RAW",
                    "Edited",
                    "Exports for Social-Print"
                ]
            }
        elif template_name == "videography_client":
            return {
                "folders": [
                    "Footage",
                    "Edited",
                    "Deliverables", 
                    "Contracts & Briefs",
                    "Exports",
                    "Thumbnail & Graphics",
                    "Audio"
                ],
                "subfolders": {
                    "Footage": ["RAW"]
                },
                "optional_folders": [
                    "Footage/Proxies"
                ]
            }
        elif template_name == "videography_personal":
            return {
                "folders": [
                    "Footage",
                    "Edited",
                    "Exports",
                    "Audio"
                ],
                "subfolders": {
                    "Footage": ["RAW"]
                },
                "optional_folders": [
                    "Footage/Proxies"
                ]
            }
        elif template_name == "assets":
            return {
                "folders": [
                    "Presets & Templates",
                    "Stock Footage & Images", 
                    "Music & Sound Effects"
                ],
                "subfolders": {
                    "Presets & Templates": [
                        "Lightroom Presets",
                        "LUTs for Video",
                        "Photoshop Templates",
                        "Final Cut Pro-Premiere Templates"
                    ],
                    "Stock Footage & Images": [
                        "Videos",
                        "Photos"
                    ],
                    "Music & Sound Effects": [
                        "Licensed Music",
                        "Sound Effects"
                    ]
                }
            }
        
        return {"folders": []}
    
    def generate_project_folder_name(self, config: ProjectConfig) -> str:
        """Generate the project folder name based on configuration."""
        date_str = config.project_date.strftime(self.config.default_options["date_format"])
        
        if config.work_type == WorkType.CLIENT:
            return f"{date_str}-{config.project_name}"
        else:
            # For personal work, just use project name
            return config.project_name
    
    def get_project_base_path(self, config: ProjectConfig, analysis: Dict[str, Any] = None) -> Path:
        """Get the base path where the project should be created, considering current directory analysis."""
        if config.base_path:
            base = Path(config.base_path)
        else:
            base = config_manager.get_base_path()
        
        # If we have directory analysis and should use smart path detection
        if analysis and analysis.get("is_in_structure") and analysis.get("use_smart_detection"):
            base = analysis["suggested_base"]
        
        # Determine project type folder
        skip_folders = analysis.get("skip_folders", []) if analysis else []
        
        if config.project_type == ProjectType.PHOTOGRAPHY and "photography" not in skip_folders:
            type_folder = self.config.base_directories["photography"]
        elif config.project_type == ProjectType.VIDEOGRAPHY and "videography" not in skip_folders:
            type_folder = self.config.base_directories["videography"]
        else:
            # For both, or if we're skipping type folder
            type_folder = ""
        
        # Add work type subfolder
        if config.work_type == WorkType.CLIENT and "client_work" not in skip_folders:
            work_subfolder = self.config.client_work_subfolder
        elif config.work_type == WorkType.PERSONAL and "personal_work" not in skip_folders:
            work_subfolder = self.config.personal_work_subfolder
        else:
            work_subfolder = ""
        
        # Build the path
        if type_folder and work_subfolder:
            full_path = base / type_folder / work_subfolder
        elif type_folder:
            full_path = base / type_folder
        elif work_subfolder:
            full_path = base / work_subfolder
        else:
            full_path = base
        
        # Add client folder for client work
        if (config.work_type == WorkType.CLIENT and config.client_name and 
            "client_folder" not in skip_folders):
            full_path = full_path / config.client_name
        elif (config.work_type == WorkType.PERSONAL and 
              "year_folder" not in skip_folders):
            # Add year folder for personal work
            year = str(config.project_date.year)
            full_path = full_path / year
        
        return full_path
    
    def create_folders(self, base_path: Path, template: Dict[str, Any], config: ProjectConfig) -> List[Path]:
        """Create folders based on template and configuration."""
        created_folders = []
        
        # Create main folders
        for folder_name in template.get("folders", []):
            folder_path = base_path / folder_name
            folder_path.mkdir(parents=True, exist_ok=True)
            created_folders.append(folder_path)
        
        # Create subfolders
        subfolders = template.get("subfolders", {})
        for parent_folder, child_folders in subfolders.items():
            parent_path = base_path / parent_folder
            parent_path.mkdir(parents=True, exist_ok=True)
            
            for child_folder in child_folders:
                child_path = parent_path / child_folder
                child_path.mkdir(parents=True, exist_ok=True)
                created_folders.append(child_path)
                
                # Create camera folders if enabled and this is a RAW folder
                if (config.use_camera_folders and 
                    child_folder == "RAW" and 
                    config.camera_assignments and
                    config.project_type in [ProjectType.VIDEOGRAPHY, ProjectType.BOTH]):
                    
                    for camera_assignment in config.camera_assignments:
                        camera_folder_name = camera_assignment.get_folder_name()
                        camera_folder_path = child_path / camera_folder_name
                        camera_folder_path.mkdir(parents=True, exist_ok=True)
                        created_folders.append(camera_folder_path)
        
        # Create optional folders based on configuration
        optional_folders = template.get("optional_folders", [])
        for optional_folder in optional_folders:
            should_create = False
            
            if "Capture One" in optional_folder and config.include_capture_one:
                should_create = True
            elif "Proxies" in optional_folder and config.include_proxies:
                should_create = True
            
            if should_create:
                folder_path = base_path / optional_folder
                folder_path.mkdir(parents=True, exist_ok=True)
                created_folders.append(folder_path)
                
                # Create camera folders in Proxies if enabled
                if (config.use_camera_folders and 
                    "Proxies" in optional_folder and 
                    config.camera_assignments and
                    config.project_type in [ProjectType.VIDEOGRAPHY, ProjectType.BOTH]):
                    
                    for camera_assignment in config.camera_assignments:
                        camera_folder_name = camera_assignment.get_folder_name()
                        camera_folder_path = folder_path / camera_folder_name
                        camera_folder_path.mkdir(parents=True, exist_ok=True)
                        created_folders.append(camera_folder_path)
        
        return created_folders
    
    def generate_project(self, config: ProjectConfig, directory_analysis: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate a complete project structure."""
        results = {
            "success": True,
            "message": "",
            "created_folders": [],
            "project_paths": []
        }
        
        try:
            project_folder_name = self.generate_project_folder_name(config)
            
            # Handle both photo and video projects
            project_types = []
            if config.project_type == ProjectType.BOTH:
                project_types = [ProjectType.PHOTOGRAPHY, ProjectType.VIDEOGRAPHY]
            else:
                project_types = [config.project_type]
            
            for project_type in project_types:
                # Create a new config for each type
                type_config = ProjectConfig(**config.dict())
                type_config.project_type = project_type
                
                # Get base path for this project type
                base_path = self.get_project_base_path(type_config, directory_analysis)
                project_path = base_path / project_folder_name
                
                # Determine template name
                if project_type == ProjectType.PHOTOGRAPHY:
                    template_name = f"photography_{config.work_type.value}"
                else:
                    template_name = f"videography_{config.work_type.value}"
                
                # Load template and create folders
                template = self.load_template(template_name)
                created_folders = self.create_folders(project_path, template, type_config)
                
                results["created_folders"].extend(created_folders)
                results["project_paths"].append(project_path)
            
            # Add project to client if it's client work
            if config.work_type == WorkType.CLIENT and config.client_name:
                client_manager.add_project_to_client(config.client_name, project_folder_name)
            
            results["message"] = f"Successfully created project: {project_folder_name}"
            
        except Exception as e:
            results["success"] = False
            results["message"] = f"Error creating project: {str(e)}"
        
        return results
    
    def generate_assets_structure(self, base_path: Optional[Path] = None) -> Dict[str, Any]:
        """Generate the Assets & Resources folder structure."""
        results = {
            "success": True,
            "message": "",
            "created_folders": []
        }
        
        try:
            if base_path is None:
                base_path = config_manager.get_base_path()
            
            assets_path = base_path / self.config.base_directories["assets"]
            template = self.load_template("assets")
            
            # Create a dummy config for the assets generation
            dummy_config = ProjectConfig(
                project_type=ProjectType.PHOTOGRAPHY,
                work_type=WorkType.PERSONAL,
                project_name="Assets"
            )
            
            created_folders = self.create_folders(assets_path, template, dummy_config)
            results["created_folders"] = created_folders
            results["message"] = f"Successfully created Assets & Resources structure at: {assets_path}"
            
        except Exception as e:
            results["success"] = False
            results["message"] = f"Error creating assets structure: {str(e)}"
        
        return results


# Global generator instance
project_generator = ProjectGenerator() 