"""
Main CLI interface for the SBP Folder Generator.
"""

import click
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
import questionary
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text

from .models import ProjectType, WorkType, ProjectConfig, Camera, CameraPurpose, CameraAssignment
from .client_manager import client_manager
from .generators import project_generator
from .config import config_manager

console = Console()


def print_success(message: str):
    """Print success message with rich formatting."""
    console.print(f"✅ {message}", style="green")


def print_error(message: str):
    """Print error message with rich formatting."""
    console.print(f"❌ {message}", style="red")


def print_warning(message: str):
    """Print warning message with rich formatting."""
    console.print(f"⚠️ {message}", style="yellow")


def print_info(message: str):
    """Print info message with rich formatting."""
    console.print(f"ℹ️ {message}", style="blue")


def _client_folder_exists(client_name: str, project_type: str, directory_analysis: Dict[str, Any] = None) -> bool:
    """Check if a client actually has corresponding folders in the filesystem."""
    try:
        from pathlib import Path
        
        # Get potential client work paths based on project type
        base_paths = []
        
        # Use smart detection base if available
        if directory_analysis and directory_analysis.get("suggested_base"):
            base = Path(directory_analysis["suggested_base"])
        else:
            base = config_manager.get_base_path()
        
        # Check both PHOTO and VIDEO folders for the client
        folder_names = ["PHOTO", "VIDEO", "Photography", "Videography"]
        if project_type == "photo":
            folder_names = ["PHOTO", "Photography"]
        elif project_type == "video":
            folder_names = ["VIDEO", "Videography"]
        
        for folder_name in folder_names:
            type_path = base / folder_name
            if type_path.exists():
                client_work_path = type_path / "Client Work"
                if client_work_path.exists():
                    client_folder = client_work_path / client_name
                    if client_folder.exists() and client_folder.is_dir():
                        return True
        
        return False
    except Exception:
        return False


@click.group()
@click.version_option(version="0.1.0", prog_name="structure-cli")
def cli():
    """
    Creative Structure CLI
    
    A powerful tool for generating standardized folder structures for photo and video projects.
    """
    pass


@cli.command()
@click.option('--type', 'project_type', 
              type=click.Choice(['photo', 'video', 'both']), 
              help='Type of project (photo/video/both)')
@click.option('--work-type', 'work_type',
              type=click.Choice(['client', 'personal']),
              help='Type of work (client/personal)')
@click.option('--client', 'client_name',
              help='Client name (required for client work)')
@click.option('--project', 'project_name',
              help='Project name')
@click.option('--date', 'project_date',
              help='Project date (YYYY-MM-DD format, defaults to today)')
@click.option('--base-path', 'base_path',
              type=click.Path(exists=True, file_okay=False, dir_okay=True),
              help='Base path where folders should be created')
@click.option('--capture-one', is_flag=True,
              help='Include Capture One folder for photo projects')
@click.option('--proxies', is_flag=True,
              help='Include Proxies folder for video projects')
@click.option('--no-smart-path', is_flag=True,
              help='Disable smart path detection (always create full folder structure)')
@click.option('--cameras', 
              help='Camera setup (format: purpose1:camera1,purpose2:camera2) e.g., main:lumix,BTS:DJI-POCKET')
def create(project_type: str, work_type: str, client_name: str, project_name: str, 
           project_date: str, base_path: str, capture_one: bool, proxies: bool, no_smart_path: bool, cameras: str):
    """Create a new project folder structure."""
    
    try:
        # Parse date if provided
        if project_date:
            try:
                parsed_date = datetime.strptime(project_date, '%Y-%m-%d')
            except ValueError:
                print_error("Invalid date format. Use YYYY-MM-DD format.")
                return
        else:
            parsed_date = datetime.now()
        
        # Validate required fields
        if not project_type:
            print_error("Project type is required. Use --type option.")
            return
        
        if not work_type:
            print_error("Work type is required. Use --work-type option.")
            return
        
        if not project_name:
            print_error("Project name is required. Use --project option.")
            return
        
        if work_type == 'client' and not client_name:
            print_error("Client name is required for client work. Use --client option.")
            return
        
        # Parse camera assignments
        camera_assignments = []
        use_camera_folders = False
        
        if cameras and project_type in ['video', 'both']:
            try:
                use_camera_folders = True
                default_cameras = {cam['name'].lower(): Camera(**cam) for cam in config_manager.config.default_cameras}
                
                for assignment_str in cameras.split(','):
                    assignment_str = assignment_str.strip()
                    if ':' not in assignment_str:
                        print_error(f"Invalid camera format: {assignment_str}. Use format: purpose:camera")
                        return
                    
                    purpose_str, camera_str = assignment_str.split(':', 1)
                    purpose_str = purpose_str.strip().upper()
                    camera_str = camera_str.strip()
                    
                    # Validate purpose
                    try:
                        purpose = CameraPurpose(purpose_str.lower())
                    except ValueError:
                        # Try common aliases
                        purpose_aliases = {
                            'MAIN': CameraPurpose.MAIN,
                            'PRIMARY': CameraPurpose.MAIN,
                            'BTS': CameraPurpose.BTS,
                            'BEHIND': CameraPurpose.BTS,
                            'SECONDARY': CameraPurpose.SECONDARY,
                            'SEC': CameraPurpose.SECONDARY,
                            'DRONE': CameraPurpose.DRONE,
                            'AERIAL': CameraPurpose.DRONE,
                            'INTERVIEW': CameraPurpose.INTERVIEW,
                            'DETAIL': CameraPurpose.DETAIL,
                            'BACKUP': CameraPurpose.BACKUP
                        }
                        if purpose_str in purpose_aliases:
                            purpose = purpose_aliases[purpose_str]
                        else:
                            print_error(f"Invalid purpose: {purpose_str}. Valid options: {', '.join([p.value for p in CameraPurpose])}")
                            return
                    
                    # Find or create camera
                    camera_key = camera_str.lower().replace('-', ' ').replace('_', ' ')
                    if camera_key in default_cameras:
                        camera = default_cameras[camera_key]
                    else:
                        # Create custom camera
                        camera = Camera(name=camera_str)
                    
                    assignment = CameraAssignment(camera=camera, purpose=purpose)
                    camera_assignments.append(assignment)
                
                print_info(f"📹 Camera setup: {', '.join([a.get_folder_name() for a in camera_assignments])}")
                
            except Exception as e:
                print_error(f"Error parsing camera assignments: {str(e)}")
                return
        
        # Create project configuration
        config = ProjectConfig(
            project_type=ProjectType(project_type),
            work_type=WorkType(work_type),
            project_name=project_name,
            client_name=client_name,
            project_date=parsed_date,
            base_path=base_path,
            include_capture_one=capture_one,
            include_proxies=proxies,
            camera_assignments=camera_assignments,
            use_camera_folders=use_camera_folders
        )
        
        # Analyze current directory for smart path detection
        directory_analysis = project_generator.analyze_current_directory()
        
        # Show analysis if we're in structure (but don't ask in non-interactive mode)
        if directory_analysis["is_in_structure"] and not no_smart_path:
            print_info("🔍 Smart path detection enabled:")
            print_info(f"   Current directory: {Path.cwd()}")
            if directory_analysis["detected_type"]:
                type_display = "Photo" if directory_analysis['detected_type'] == "photography" else "Video"
                print_info(f"   📁 Detected type: {type_display}")
            if directory_analysis["detected_work_type"]:
                print_info(f"   💼 Detected work type: {directory_analysis['detected_work_type'].title()}")
            if directory_analysis["detected_client"]:
                print_info(f"   👥 Detected client: {directory_analysis['detected_client']}")
            if directory_analysis["discovered_clients"]:
                print_info(f"   📁 Found client folders: {', '.join(directory_analysis['discovered_clients'])}")
            print_info(f"   ⚡ Will skip creating: {', '.join(directory_analysis['skip_folders'])}")
            directory_analysis["use_smart_detection"] = True
        else:
            if no_smart_path and directory_analysis["is_in_structure"]:
                print_info("📍 Smart path detection disabled by --no-smart-path flag")
            directory_analysis["use_smart_detection"] = False
        
        # Generate project
        result = project_generator.generate_project(config, directory_analysis)
        
        if result["success"]:
            print_success(result["message"])
            print_info(f"Created {len(result['created_folders'])} folders:")
            for folder in result["created_folders"]:
                console.print(f"  📁 {folder}")
            
            # Add client to database only after successful project creation
            if config.work_type == WorkType.CLIENT and config.client_name:
                discovered_clients = directory_analysis.get("discovered_clients", []) if directory_analysis else []
                database_clients = client_manager.list_clients()
                
                if config.client_name not in database_clients:
                    try:
                        client_manager.add_client(config.client_name)
                        if config.client_name in discovered_clients:
                            print_success(f"Added discovered client to database: {config.client_name}")
                        else:
                            print_success(f"Added new client to database: {config.client_name}")
                    except ValueError as e:
                        print_warning(f"Could not add client to database: {str(e)}")
        else:
            print_error(result["message"])
    
    except Exception as e:
        print_error(f"Error creating project: {str(e)}")


@cli.command()
def interactive():
    """Run in interactive mode with prompts."""
    console.print(Panel.fit("🎬 SBP Folder Generator - Interactive Mode", style="bold blue"))
    
    try:
        # Analyze current directory first
        directory_analysis = project_generator.analyze_current_directory()
        
        # Show directory analysis if we detected something
        if directory_analysis["is_in_structure"]:
            console.print("\n🔍 Smart Path Detection:", style="bold yellow")
            console.print(f"   Current directory: {Path.cwd()}")
            
            if directory_analysis["detected_type"]:
                type_display = "Photo" if directory_analysis['detected_type'] == "photography" else "Video"
                console.print(f"   📁 Detected type: {type_display}")
            if directory_analysis["detected_work_type"]:
                console.print(f"   💼 Detected work type: {directory_analysis['detected_work_type'].title()}")
            if directory_analysis["detected_client"]:
                console.print(f"   👥 Detected client: {directory_analysis['detected_client']}")
            if directory_analysis["discovered_clients"]:
                console.print(f"   📁 Found client folders: {', '.join(directory_analysis['discovered_clients'])}")
            if directory_analysis["detected_year"]:
                console.print(f"   📅 Detected year: {directory_analysis['detected_year']}")
            
            console.print(f"   ⚡ Will skip creating: {', '.join(directory_analysis['skip_folders'])}")
            
            use_smart_detection = questionary.confirm(
                "Use smart path detection? (Skip creating folders that already exist in path)",
                default=True
            ).ask()
            
            if use_smart_detection is None:
                print_info("Operation cancelled.")
                return
                
            directory_analysis["use_smart_detection"] = use_smart_detection
            
            if use_smart_detection:
                print_success("✅ Using smart path detection - will create project in optimal location.")
            else:
                print_info("📍 Will use standard folder creation from current directory.")
            
            console.print()
        else:
            directory_analysis["use_smart_detection"] = False
        
        # Project type selection - pre-fill if detected
        default_project_type = None
        if directory_analysis.get("detected_type") and directory_analysis.get("use_smart_detection"):
            if directory_analysis["detected_type"] == "photography":
                default_project_type = "photo"
            elif directory_analysis["detected_type"] == "videography":
                default_project_type = "video"
        
        project_type_choices = [
            questionary.Choice("📸 Photo", "photo"),
            questionary.Choice("🎥 Video", "video"),
            questionary.Choice("📸🎥 Both (Photo + Video)", "both")
        ]
        
        if default_project_type:
            # Move the detected type to the front and mark it
            for i, choice in enumerate(project_type_choices):
                if choice.value == default_project_type:
                    choice.title = f"✨ {choice.title} (detected)"
                    project_type_choices.insert(0, project_type_choices.pop(i))
                    break
        
        project_type = questionary.select(
            "What type of project are you creating?",
            choices=project_type_choices
        ).ask()
        
        if not project_type:
            print_info("Operation cancelled.")
            return
        
        # Work type selection - pre-fill if detected
        default_work_type = None
        if directory_analysis.get("detected_work_type") and directory_analysis.get("use_smart_detection"):
            default_work_type = directory_analysis["detected_work_type"]
        
        work_type_choices = [
            questionary.Choice("👥 Client Work", "client"),
            questionary.Choice("🎨 Personal Work", "personal")
        ]
        
        if default_work_type:
            for i, choice in enumerate(work_type_choices):
                if choice.value == default_work_type:
                    choice.title = f"✨ {choice.title} (detected)"
                    work_type_choices.insert(0, work_type_choices.pop(i))
                    break
        
        work_type = questionary.select(
            "Is this client work or personal work?",
            choices=work_type_choices
        ).ask()
        
        if not work_type:
            print_info("Operation cancelled.")
            return
        
        # Client selection for client work
        client_name = None
        if work_type == "client":
            # Check if we detected a client name
            detected_client = directory_analysis.get("detected_client") if directory_analysis.get("use_smart_detection") else None
            
            # Get clients from database
            database_clients = client_manager.list_clients()
            
            # Get discovered clients from filesystem
            discovered_clients = directory_analysis.get("discovered_clients", []) if directory_analysis.get("use_smart_detection") else []
            
            # Validate database clients against actual folders (remove phantom clients)
            existing_clients = []
            for client in database_clients:
                if self._client_folder_exists(client, project_type, directory_analysis):
                    existing_clients.append(client)
            
            # Merge and deduplicate clients (discovered clients take priority for display order)
            all_clients = []
            # Add discovered clients first (from filesystem)
            for client in discovered_clients:
                if client not in all_clients:
                    all_clients.append(client)
            # Add validated database clients that aren't already in the list
            for client in existing_clients:
                if client not in all_clients:
                    all_clients.append(client)
            
            if all_clients:
                client_choices = []
                
                # Add clients with appropriate indicators
                for client in all_clients:
                    if client in discovered_clients and client in existing_clients:
                        # Client exists in both filesystem and database
                        if client == detected_client:
                            client_choices.append(questionary.Choice(f"✨ 📁📋 {client} (current location)", client))
                        else:
                            client_choices.append(questionary.Choice(f"📁📋 {client}", client))
                    elif client in discovered_clients:
                        # Client discovered from filesystem only
                        if client == detected_client:
                            client_choices.append(questionary.Choice(f"✨ 📁 {client} (current location)", client))
                        else:
                            client_choices.append(questionary.Choice(f"📁 {client} (from folders)", client))
                    else:
                        # Client from database only
                        client_choices.append(questionary.Choice(f"📋 {client}", client))
                
                client_choices.append(questionary.Choice("➕ Add New Client", "new"))
                
                # Show discovered clients info if any
                if discovered_clients:
                    console.print(f"\n💡 Found {len(discovered_clients)} existing client folders: {', '.join(discovered_clients)}")
                
                client_choice = questionary.select(
                    "Select a client:",
                    choices=client_choices
                ).ask()
                
                if not client_choice:
                    print_info("Operation cancelled.")
                    return
                
                if client_choice == "new":
                    client_name = questionary.text("Enter new client name:").ask()
                    if not client_name:
                        print_info("Operation cancelled.")
                        return
                else:
                    client_name = client_choice
            else:
                # No clients in database, but check if we have discovered clients from filesystem
                if discovered_clients:
                    console.print(f"\n💡 Found {len(discovered_clients)} existing client folders: {', '.join(discovered_clients)}")
                    
                    client_choices = []
                    for client in discovered_clients:
                        if client == detected_client:
                            client_choices.append(questionary.Choice(f"✨ 📁 {client} (current location)", client))
                        else:
                            client_choices.append(questionary.Choice(f"📁 {client} (from folders)", client))
                    client_choices.append(questionary.Choice("➕ Add New Client", "new"))
                    
                    client_choice = questionary.select(
                        "Select a client:",
                        choices=client_choices
                    ).ask()
                    
                    if not client_choice:
                        print_info("Operation cancelled.")
                        return
                    
                    if client_choice == "new":
                        client_name = questionary.text("Enter new client name:").ask()
                        if not client_name:
                            print_info("Operation cancelled.")
                            return
                    else:
                        client_name = client_choice
                        
                elif detected_client:
                    # Only detected client, no database or discovered clients
                    use_detected = questionary.confirm(
                        f"Use detected client '{detected_client}'?",
                        default=True
                    ).ask()
                    
                    if use_detected:
                        client_name = detected_client
                    else:
                        client_name = questionary.text("Enter client name:").ask()
                    
                    if not client_name:
                        print_info("Operation cancelled.")
                        return
                else:
                    # No clients found anywhere
                    client_name = questionary.text("Enter client name (no existing clients found):").ask()
                    
                    if not client_name:
                        print_info("Operation cancelled.")
                        return
        
        # Project name
        project_name = questionary.text("Enter project name:").ask()
        if not project_name:
            print_info("Operation cancelled.")
            return
        
        # Project date
        use_today = questionary.confirm("Use today's date?", default=True).ask()
        if use_today:
            project_date = datetime.now()
        else:
            date_str = questionary.text(
                "Enter project date (YYYY-MM-DD):",
                default=datetime.now().strftime('%Y-%m-%d')
            ).ask()
            
            if not date_str:
                print_info("Operation cancelled.")
                return
            
            try:
                project_date = datetime.strptime(date_str, '%Y-%m-%d')
            except ValueError:
                print_error("Invalid date format. Using today's date.")
                project_date = datetime.now()
        
        # Optional settings
        include_capture_one = False
        include_proxies = False
        camera_assignments = []
        use_camera_folders = False
        
        if project_type in ["photo", "both"]:
            include_capture_one = questionary.confirm(
                "Include Capture One folder for photo projects?", 
                default=False
            ).ask()
        
        if project_type in ["video", "both"]:
            include_proxies = questionary.confirm(
                "Include Proxies folder for video projects?", 
                default=False
            ).ask()
            
            # Camera setup for video projects
            use_camera_folders = questionary.confirm(
                "Set up multi-camera folders? (Creates separate folders like main-lumix, BTS-DJI-POCKET)",
                default=False
            ).ask()
            
            if use_camera_folders:
                console.print("\n📹 Camera Setup:", style="bold blue")
                console.print("Set up your cameras and their purposes (main, BTS, secondary, etc.)")
                
                # Get default cameras from config
                default_cameras = [Camera(**cam_data) for cam_data in config_manager.config.default_cameras]
                
                while True:
                    # Show current assignments
                    if camera_assignments:
                        console.print("\n📋 Current Camera Setup:")
                        for i, assignment in enumerate(camera_assignments, 1):
                            console.print(f"   {i}. {assignment.get_folder_name()}")
                    
                    action = questionary.select(
                        "What would you like to do?",
                        choices=[
                            questionary.Choice("➕ Add Camera Assignment", "add"),
                            questionary.Choice("✅ Done with Camera Setup", "done"),
                            questionary.Choice("🗑️ Remove Assignment", "remove") if camera_assignments else None
                        ]
                    ).ask()
                    
                    if action == "done" or action is None:
                        break
                    elif action == "remove" and camera_assignments:
                        remove_choices = [
                            questionary.Choice(f"{assignment.get_folder_name()}", i) 
                            for i, assignment in enumerate(camera_assignments)
                        ]
                        to_remove = questionary.select(
                            "Which assignment to remove?",
                            choices=remove_choices
                        ).ask()
                        
                        if to_remove is not None:
                            camera_assignments.pop(to_remove)
                    elif action == "add":
                        # Select purpose
                        purpose_choices = [
                            questionary.Choice(f"🎬 {purpose.value.title()}", purpose.value)
                            for purpose in CameraPurpose
                        ]
                        
                        selected_purpose = questionary.select(
                            "What's this camera's purpose?",
                            choices=purpose_choices
                        ).ask()
                        
                        if selected_purpose is None:
                            continue
                        
                        # Select camera
                        camera_choices = [
                            questionary.Choice(f"📷 {camera.name}", camera) 
                            for camera in default_cameras
                        ]
                        camera_choices.append(questionary.Choice("➕ Add Custom Camera", "custom"))
                        
                        selected_camera = questionary.select(
                            "Which camera?",
                            choices=camera_choices
                        ).ask()
                        
                        if selected_camera is None:
                            continue
                        elif selected_camera == "custom":
                            camera_name = questionary.text("Enter camera name:").ask()
                            if not camera_name:
                                continue
                            camera_brand = questionary.text("Enter camera brand (optional):").ask()
                            selected_camera = Camera(name=camera_name, brand=camera_brand or None)
                        
                        # Create assignment
                        assignment = CameraAssignment(
                            camera=selected_camera,
                            purpose=CameraPurpose(selected_purpose)
                        )
                        
                        # Check for duplicates
                        folder_name = assignment.get_folder_name()
                        if any(existing.get_folder_name() == folder_name for existing in camera_assignments):
                            print_warning(f"Assignment '{folder_name}' already exists!")
                        else:
                            camera_assignments.append(assignment)
                            print_success(f"Added: {folder_name}")
                
                if not camera_assignments:
                    use_camera_folders = False
                    print_info("No camera assignments created, disabling camera folders.")
        
        # Base path
        use_current_dir = questionary.confirm("Create folders in current directory?", default=True).ask()
        base_path = None
        if not use_current_dir:
            base_path = questionary.path("Enter base path:").ask()
            if not base_path:
                print_info("Using current directory.")
        
        # Create configuration
        config = ProjectConfig(
            project_type=ProjectType(project_type),
            work_type=WorkType(work_type),
            project_name=project_name,
            client_name=client_name,
            project_date=project_date,
            base_path=base_path,
            include_capture_one=include_capture_one,
            include_proxies=include_proxies,
            camera_assignments=camera_assignments,
            use_camera_folders=use_camera_folders
        )
        
        # Show preview
        console.print("\n" + "="*50)
        console.print("📋 Project Summary:", style="bold")
        console.print(f"   Project Type: {project_type.title()}")
        console.print(f"   Work Type: {work_type.title()}")
        if client_name:
            console.print(f"   Client: {client_name}")
        console.print(f"   Project Name: {project_name}")
        console.print(f"   Date: {project_date.strftime('%Y-%m-%d')}")
        if base_path:
            console.print(f"   Base Path: {base_path}")
        
        if include_capture_one:
            console.print("   ✓ Include Capture One folder")
        if include_proxies:
            console.print("   ✓ Include Proxies folder")
        if use_camera_folders and camera_assignments:
            console.print("   📹 Camera Folders:")
            for assignment in camera_assignments:
                console.print(f"      • {assignment.get_folder_name()}")
        
        console.print("="*50 + "\n")
        
        # Confirm creation
        if questionary.confirm("Create this project structure?", default=True).ask():
            result = project_generator.generate_project(config, directory_analysis)
            
            if result["success"]:
                print_success(result["message"])
                print_info(f"Created {len(result['created_folders'])} folders:")
                for folder in result["created_folders"]:
                    console.print(f"  📁 {folder}")
                
                # Add client to database only after successful project creation
                if config.work_type == WorkType.CLIENT and config.client_name:
                    # Check if client is from discovered clients or database clients
                    discovered_clients = directory_analysis.get("discovered_clients", []) if directory_analysis else []
                    database_clients = client_manager.list_clients()
                    
                    if config.client_name not in database_clients:
                        try:
                            client_manager.add_client(config.client_name)
                            if config.client_name in discovered_clients:
                                print_success(f"Added discovered client to database: {config.client_name}")
                            else:
                                print_success(f"Added new client to database: {config.client_name}")
                        except ValueError as e:
                            print_warning(f"Could not add client to database: {str(e)}")
            else:
                print_error(result["message"])
        else:
            print_info("Project creation cancelled.")
    
    except KeyboardInterrupt:
        print_info("\nOperation cancelled by user.")
    except Exception as e:
        print_error(f"Error in interactive mode: {str(e)}")


@cli.group()
def clients():
    """Manage clients."""
    pass


@clients.command('list')
def list_clients():
    """List all clients."""
    client_list = client_manager.list_clients()
    
    if not client_list:
        print_info("No clients found.")
        return
    
    table = Table(title="📋 Clients")
    table.add_column("Name", style="cyan")
    table.add_column("Projects", style="green")
    table.add_column("Created", style="yellow")
    
    for client_name in client_list:
        client = client_manager.get_client(client_name)
        project_count = len(client.projects) if client.projects else 0
        created_date = client.created_date.strftime('%Y-%m-%d') if client.created_date else "N/A"
        
        table.add_row(client_name, str(project_count), created_date)
    
    console.print(table)


@clients.command('add')
@click.argument('name')
@click.option('--notes', help='Optional notes about the client')
def add_client(name: str, notes: str):
    """Add a new client."""
    try:
        client = client_manager.add_client(name, notes)
        print_success(f"Added client: {client.name}")
    except ValueError as e:
        print_error(str(e))


@clients.command('remove')
@click.argument('name')
def remove_client(name: str):
    """Remove a client."""
    if client_manager.delete_client(name):
        print_success(f"Removed client: {name}")
    else:
        print_error(f"Client not found: {name}")


@clients.command('search')
@click.argument('query')
def search_clients(query: str):
    """Search for clients by name."""
    results = client_manager.search_clients(query)
    
    if not results:
        print_info(f"No clients found matching '{query}'.")
        return
    
    print_info(f"Found {len(results)} client(s) matching '{query}':")
    for client_name in results:
        console.print(f"  📋 {client_name}")


@cli.command()
@click.option('--path', type=click.Path(exists=True, file_okay=False, dir_okay=True),
              help='Base path where Assets & Resources should be created')
def setup_assets(path: str):
    """Setup the Assets & Resources folder structure."""
    try:
        base_path = Path(path) if path else None
        result = project_generator.generate_assets_structure(base_path)
        
        if result["success"]:
            print_success(result["message"])
            print_info(f"Created {len(result['created_folders'])} folders:")
            for folder in result["created_folders"]:
                console.print(f"  📁 {folder}")
        else:
            print_error(result["message"])
    
    except Exception as e:
        print_error(f"Error setting up assets structure: {str(e)}")


@cli.command()
def cameras():
    """Show camera setup examples and available options."""
    console.print(Panel.fit("📹 Camera Setup Guide", style="bold blue"))
    
    # Show available purposes
    console.print("\n🎬 Available Camera Purposes:", style="bold")
    for purpose in CameraPurpose:
        console.print(f"   • {purpose.value}")
    
    # Show default cameras
    console.print("\n📷 Default Cameras:", style="bold")
    for cam_data in config_manager.config.default_cameras:
        brand = f" ({cam_data['brand']})" if cam_data.get('brand') else ""
        console.print(f"   • {cam_data['name']}{brand}")
    
    # Show examples
    console.print("\n💡 Example Usage:", style="bold")
    console.print("   Interactive mode:")
    console.print("   python3 -m sbp_generator.cli interactive")
    console.print("   (Follow prompts for camera setup)")
    
    console.print("\n   Command line:")
    console.print("   python3 -m sbp_generator.cli create --type video --work-type client \\")
    console.print("     --client 'ABC Corp' --project 'Commercial' \\")
    console.print("     --cameras 'main:lumix,BTS:DJI POCKET,drone:drone'")
    
    console.print("\n   More examples:")
    console.print("   --cameras 'main:fujifilm,secondary:canon'")
    console.print("   --cameras 'main:sony,BTS:lumix,interview:canon,drone:DJI POCKET'")
    
    console.print("\n📁 This creates folders like:", style="bold")
    console.print("   Footage/RAW/main-lumix/")
    console.print("   Footage/RAW/BTS-DJI-POCKET/")
    console.print("   Footage/RAW/drone-drone/")
    console.print("   Footage/Proxies/main-lumix/ (if proxies enabled)")


@cli.command()
def config():
    """Show current configuration."""
    config = config_manager.config
    
    table = Table(title="⚙️ Configuration")
    table.add_column("Setting", style="cyan")
    table.add_column("Value", style="green")
    
    table.add_row("Photo Folder", config.base_directories["photography"])
    table.add_row("Video Folder", config.base_directories["videography"])
    table.add_row("Assets Folder", config.base_directories["assets"])
    table.add_row("Client Work Subfolder", config.client_work_subfolder)
    table.add_row("Personal Work Subfolder", config.personal_work_subfolder)
    table.add_row("Date Format", config.default_options["date_format"])
    table.add_row("Include Capture One (default)", str(config.default_options["include_capture_one"]))
    table.add_row("Include Proxies (default)", str(config.default_options["include_proxies"]))
    
    console.print(table)
    
    # Show default cameras
    console.print("\n📷 Default Cameras:")
    for cam_data in config.default_cameras:
        brand = f" ({cam_data['brand']})" if cam_data.get('brand') else ""
        console.print(f"   • {cam_data['name']}{brand}")
    
    # Show config file location
    print_info(f"Configuration file: {config_manager.config_file}")
    print_info(f"Clients database: {config_manager.clients_file}")


@cli.command()
def reset_config():
    """Reset configuration to defaults (use this to get new folder names)."""
    if questionary.confirm(
        "Reset configuration to defaults? This will update folder names to PHOTO/VIDEO.",
        default=False
    ).ask():
        try:
            config_manager.reset_config()
            print_success("✅ Configuration reset to defaults!")
            print_info("📁 Folder names updated:")
            print_info("   • Photography → PHOTO")
            print_info("   • Videography → VIDEO")
            print_info("💡 Run 'sbp-gen config' to see updated settings.")
        except Exception as e:
            print_error(f"Error resetting configuration: {str(e)}")
    else:
        print_info("Configuration reset cancelled.")


def main():
    """Main entry point for the CLI."""
    cli()


if __name__ == '__main__':
    main() 