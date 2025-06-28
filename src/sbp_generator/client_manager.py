"""
Client management for the SBP Folder Generator CLI.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
from .models import Client
from .config import config_manager


class ClientManager:
    """Manages client information and operations."""
    
    def __init__(self):
        self.clients_file = config_manager.clients_file
        self._clients: Optional[Dict[str, Client]] = None
    
    @property
    def clients(self) -> Dict[str, Client]:
        """Get all clients, loading from file if needed."""
        if self._clients is None:
            self.load_clients()
        return self._clients
    
    def load_clients(self) -> Dict[str, Client]:
        """Load clients from file."""
        self._clients = {}
        
        if self.clients_file.exists():
            try:
                with open(self.clients_file, 'r', encoding='utf-8') as f:
                    clients_data = json.load(f)
                    
                for name, data in clients_data.items():
                    # Convert datetime strings back to datetime objects
                    if 'created_date' in data and isinstance(data['created_date'], str):
                        data['created_date'] = datetime.fromisoformat(data['created_date'])
                    
                    self._clients[name] = Client(**data)
            except (json.JSONDecodeError, ValueError) as e:
                # If file is corrupted, start fresh
                print(f"Warning: Could not load clients file: {e}")
                self._clients = {}
        
        return self._clients
    
    def save_clients(self) -> None:
        """Save clients to file."""
        if self._clients is None:
            return
        
        # Convert to serializable format
        clients_data = {}
        for name, client in self._clients.items():
            client_dict = client.dict()
            # Convert datetime to string for JSON serialization
            if isinstance(client_dict['created_date'], datetime):
                client_dict['created_date'] = client_dict['created_date'].isoformat()
            clients_data[name] = client_dict
        
        with open(self.clients_file, 'w', encoding='utf-8') as f:
            json.dump(clients_data, f, indent=2, default=str)
    
    def add_client(self, name: str, notes: Optional[str] = None) -> Client:
        """Add a new client."""
        if name in self.clients:
            raise ValueError(f"Client '{name}' already exists")
        
        client = Client(name=name, notes=notes)
        self._clients[name] = client
        self.save_clients()
        
        return client
    
    def get_client(self, name: str) -> Optional[Client]:
        """Get a client by name."""
        return self.clients.get(name)
    
    def list_clients(self) -> List[str]:
        """Get list of all client names."""
        return list(self.clients.keys())
    
    def update_client(self, name: str, updates: Dict[str, Any]) -> Optional[Client]:
        """Update client information."""
        if name not in self.clients:
            return None
        
        client_data = self.clients[name].dict()
        client_data.update(updates)
        
        self._clients[name] = Client(**client_data)
        self.save_clients()
        
        return self._clients[name]
    
    def delete_client(self, name: str) -> bool:
        """Delete a client."""
        if name not in self.clients:
            return False
        
        del self._clients[name]
        self.save_clients()
        return True
    
    def add_project_to_client(self, client_name: str, project_name: str) -> bool:
        """Add a project to a client's project list."""
        client = self.get_client(client_name)
        if not client:
            return False
        
        if project_name not in client.projects:
            client.projects.append(project_name)
            self.save_clients()
        
        return True
    
    def search_clients(self, query: str) -> List[str]:
        """Search for clients by name (case-insensitive)."""
        query_lower = query.lower()
        return [name for name in self.clients.keys() if query_lower in name.lower()]


# Global client manager instance
client_manager = ClientManager() 