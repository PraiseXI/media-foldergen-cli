"""
Data models for the SBP Folder Generator CLI.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, validator


class ProjectType(str, Enum):
    """Enumeration for project types."""
    PHOTOGRAPHY = "photo"
    VIDEOGRAPHY = "video"
    BOTH = "both"


class WorkType(str, Enum):
    """Enumeration for work types."""
    CLIENT = "client"
    PERSONAL = "personal"


class CameraPurpose(str, Enum):
    """Enumeration for camera purposes."""
    MAIN = "main"
    BTS = "BTS"  # Behind the scenes
    SECONDARY = "secondary"
    DRONE = "drone"
    INTERVIEW = "interview"
    DETAIL = "detail"
    BACKUP = "backup"


class Camera(BaseModel):
    """Model for camera information."""
    name: str
    brand: Optional[str] = None
    model: Optional[str] = None
    notes: Optional[str] = None
    
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Camera name cannot be empty')
        return v.strip()
    
    def get_folder_name(self) -> str:
        """Get a clean folder name for this camera."""
        # Replace spaces and special characters with hyphens
        clean_name = self.name.replace(' ', '-').replace('_', '-')
        # Remove any characters that aren't alphanumeric or hyphens
        clean_name = ''.join(c for c in clean_name if c.isalnum() or c == '-')
        return clean_name


class CameraAssignment(BaseModel):
    """Model for assigning cameras to purposes."""
    camera: Camera
    purpose: CameraPurpose
    
    def get_folder_name(self) -> str:
        """Get the folder name for this camera assignment."""
        return f"{self.purpose.value}-{self.camera.get_folder_name()}"


class Client(BaseModel):
    """Model for client information."""
    name: str
    created_date: datetime = datetime.now()
    projects: List[str] = []
    notes: Optional[str] = None

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Client name cannot be empty')
        return v.strip()


class ProjectConfig(BaseModel):
    """Configuration for project creation."""
    project_type: ProjectType
    work_type: WorkType
    project_name: str
    client_name: Optional[str] = None
    project_date: datetime = datetime.now()
    base_path: Optional[str] = None
    include_capture_one: bool = False
    include_proxies: bool = False
    camera_assignments: List[CameraAssignment] = []
    use_camera_folders: bool = False

    @validator('project_name')
    def project_name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Project name cannot be empty')
        return v.strip()

    @validator('client_name')
    def validate_client_name(cls, v, values):
        if values.get('work_type') == WorkType.CLIENT and not v:
            raise ValueError('Client name is required for client work')
        return v.strip() if v else None


class FolderStructure(BaseModel):
    """Model for folder structure definitions."""
    name: str
    subfolders: List[str] = []
    optional: bool = False


class AppConfig(BaseModel):
    """Application configuration model."""
    base_directories: Dict[str, str] = {
        "photography": "PHOTO",
        "videography": "VIDEO", 
        "assets": "Assets & Resources"
    }
    default_options: Dict[str, Any] = {
        "include_capture_one": False,
        "include_proxies": False,
        "date_format": "%Y-%m-%d"
    }
    client_work_subfolder: str = "Client Work"
    personal_work_subfolder: str = "Personal Work"
    default_cameras: List[Dict[str, str]] = [
        {"name": "Lumix", "brand": "Panasonic"},
        {"name": "DJI POCKET", "brand": "DJI"},
        {"name": "Fujifilm", "brand": "Fujifilm"},
        {"name": "Canon", "brand": "Canon"},
        {"name": "Sony", "brand": "Sony"},
        {"name": "Drone", "brand": "DJI"}
    ] 