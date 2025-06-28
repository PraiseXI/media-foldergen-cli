"""
Configuration management for the SBP Folder Generator CLI.
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, Optional
from .models import AppConfig


class ConfigManager:
    """Manages application configuration."""
    
    def __init__(self):
        self.config_dir = Path.home() / ".sbp-generator"
        self.config_file = self.config_dir / "config.json"
        self.data_dir = self.config_dir / "data"
        self.clients_file = self.data_dir / "clients.json"
        self._config: Optional[AppConfig] = None
        
        # Ensure directories exist
        self.config_dir.mkdir(exist_ok=True)
        self.data_dir.mkdir(exist_ok=True)
    
    @property
    def config(self) -> AppConfig:
        """Get current configuration, loading from file if needed."""
        if self._config is None:
            self.load_config()
        return self._config
    
    def load_config(self) -> AppConfig:
        """Load configuration from file or create default."""
        if self.config_file.exists():
            with open(self.config_file, 'r', encoding='utf-8') as f:
                config_data = json.load(f)
                self._config = AppConfig(**config_data)
        else:
            self._config = AppConfig()
            self.save_config()
        
        return self._config
    
    def save_config(self) -> None:
        """Save current configuration to file."""
        if self._config is None:
            return
            
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(self._config.dict(), f, indent=2, default=str)
    
    def update_config(self, updates: Dict[str, Any]) -> None:
        """Update configuration with new values."""
        if self._config is None:
            self.load_config()
        
        # Create new config with updates
        current_data = self._config.dict()
        current_data.update(updates)
        self._config = AppConfig(**current_data)
        self.save_config()
    
    def get_base_path(self, project_type: str = None) -> Path:
        """Get base path for projects, optionally for specific type."""
        # For now, return current working directory
        # This can be configured later to use a specific base path
        base = Path.cwd()
        
        if project_type:
            type_folder = self.config.base_directories.get(project_type, project_type)
            return base / type_folder
        
        return base
    
    def reset_config(self) -> None:
        """Reset configuration to defaults."""
        self._config = AppConfig()
        self.save_config()


# Global config manager instance
config_manager = ConfigManager() 