# SBP Folder Generator CLI

A command-line interface (CLI) application to automatically generate standardized folder structures for photo and video projects, supporting both client work and personal projects.

## Features

- 📁 **Standardized Folder Structures** - Generate consistent folder layouts for photo and video projects
- 👥 **Client Management** - Store and reuse client information
- 🔍 **Automatic Client Discovery** - Automatically detects existing client folders and presents them as options
- 🎯 **Project Types** - Support for photo, video, or combined projects
- 📅 **Date-based Naming** - Automatic date formatting for project folders
- 🎨 **Interactive Mode** - User-friendly prompts for easy project creation
- 🧠 **Smart Path Detection** - Automatically detects existing folder structure and skips creating redundant folders
- 📹 **Multi-Camera Support** - Organize footage by camera and purpose (main-lumix, BTS-DJI-POCKET, etc.)
- ⚙️ **Configurable** - Customize folder structures and settings

## Installation

### From Source
```bash
git clone <repository-url>
cd sbp-folder-generator-cli
pip install -e .
```

### Using pip (when published)
```bash
pip install sbp-folder-generator
```

## Quick Start

### Interactive Mode (Recommended)
```bash
sbp-gen interactive
```

### Command Line Usage
```bash
# Create a client photography project
sbp-gen create --type photo --work-type client --client "ABC Corp" --project "Product Shoot"

# Create a personal video project
sbp-gen create --type video --work-type personal --project "Travel Documentary"

# List existing clients
sbp-gen clients list

# Add a new client
sbp-gen clients add "New Client Name"

# Setup Assets & Resources folder structure
sbp-gen setup-assets

# Multi-camera video project
sbp-gen create --type video --work-type client --client "ABC Corp" --project "Commercial" --cameras "main:lumix,BTS:DJI POCKET"

# View camera setup help
sbp-gen cameras

# Disable smart path detection (always create full structure)
sbp-gen create --type photo --work-type client --client "ABC Corp" --project "Product Shoot" --no-smart-path
```

## Folder Structure

The CLI generates standardized folder structures based on industry best practices:

### Photo Projects
```
PHOTO/
├── Client Work/
│   └── [CLIENT-NAME]/
│       └── [YYYY-MM-DD-Project Name]/
│           ├── RAW/
│           ├── Edited/
│           ├── Deliverables/
│           ├── Contracts & Briefs/
│           ├── Exports for Social-Print/
│           └── Capture One/ (optional)
└── Personal Work/
    └── [YEAR]/
        └── [Project Name]/
            ├── RAW/
            ├── Edited/
            └── Exports for Social-Print/
```

### Video Projects
```
VIDEO/
├── Client Work/
│   └── [CLIENT-NAME]/
│       └── [YYYY-MM-DD-Project Name]/
│           ├── Footage/
│           │   ├── RAW/
│           │   └── Proxies/ (optional)
│           ├── Edited/
│           ├── Deliverables/
│           ├── Contracts & Briefs/
│           ├── Exports/
│           ├── Thumbnail & Graphics/
│           └── Audio/
└── Personal Work/
    └── [YEAR]/
        └── [Project Name]/
            ├── Footage/
            ├── Edited/
            ├── Exports/
            └── Audio/
```

## Smart Path Detection

The CLI automatically detects if you're already inside part of your folder structure and intelligently skips creating redundant folders:

### How It Works
- **Detects existing structure**: If you're in `PHOTO/Client Work/ABC Corp/`, it won't recreate those folders
- **Auto-suggests values**: Pre-fills project type, work type, and client name based on your current location
- **Discovers existing clients**: Automatically scans Client Work folders to find existing clients
- **Interactive confirmation**: In interactive mode, asks if you want to use smart detection
- **Command-line control**: Use `--no-smart-path` flag to disable for specific commands

### Automatic Client Discovery

When you're in or near Client Work directories, the CLI automatically discovers existing client folders and presents them as options:

#### What Gets Discovered
- **Scans Client Work folders**: Automatically finds all client folders in `PHOTO/Client Work/` and `VIDEO/Client Work/`
- **Merges with database**: Combines discovered clients with your saved client database
- **Visual indicators**: Shows the source of each client option

#### Client Selection Display
```
💡 Found 3 existing client folders: ABC Corp, XYZ Ltd, John Doe

Select a client:
  ✨ 📁📋 ABC Corp (current location)     # In both folders and database
  📁 XYZ Ltd (from folders)              # Found in filesystem only
  📁 John Doe (from folders)             # Found in filesystem only  
  📋 Previous Client                     # From database only
  ➕ Add New Client
```

#### Auto-Discovery Benefits
- **No retyping**: Never manually type client names that already exist as folders
- **Database sync**: Discovered clients are automatically added to your database for future use
- **Smart location detection**: Highlights your current client folder location
- **Works anywhere**: Discovers clients even when you're in Personal Work or project subfolders

### Examples

```bash
# You're in: /Projects/PHOTO/Client Work/ABC Corp/
# CLI detects: Photo project, Client work, ABC Corp client
# Creates: 2024-01-15-New Project/ (directly here, no duplicate folders)

# You're in: /Projects/PHOTO/Personal Work/2024/
# CLI detects: Photo project, Personal work, 2024 year
# Creates: New Project/ (directly here)

# You're in: /Projects/PHOTO/Client Work/
# CLI detects: Photo project, Client work
# Discovers: ABC Corp, XYZ Ltd, John Doe (from existing folders)
# Presents: All discovered clients as selectable options

# You're in: /Projects/
# CLI detects: Nothing special
# Creates: PHOTO/Client Work/ABC Corp/2024-01-15-New Project/
```

## Multi-Camera Support

For video projects, organize your footage by camera and purpose with intelligent folder naming:

### How It Works
- **Purpose-based organization**: `main`, `BTS`, `secondary`, `drone`, `interview`, `detail`, `backup`
- **Camera-specific folders**: Automatically creates `purpose-camera` folder structure
- **Applies to RAW and Proxies**: Camera folders created in both `Footage/RAW/` and `Footage/Proxies/` (if enabled)

### Setup Options

**Interactive Mode** (Recommended)
```bash
python3 -m sbp_generator.cli interactive
# Follow prompts to set up cameras step-by-step
```

**Command Line**
```bash
# Single camera setup
--cameras "main:lumix"

# Multi-camera setup
--cameras "main:lumix,BTS:DJI POCKET,drone:drone"

# Complex setup
--cameras "main:fujifilm,secondary:canon,interview:sony,BTS:lumix"
```

### Example Output Structure
```
VIDEO/Client Work/ABC Corp/2024-01-15-Commercial/
├── Footage/
│   ├── RAW/
│   │   ├── main-lumix/
│   │   ├── BTS-DJI-POCKET/
│   │   └── drone-drone/
│   └── Proxies/
│       ├── main-lumix/
│       ├── BTS-DJI-POCKET/
│       └── drone-drone/
├── Edited/
├── Deliverables/
└── ...
```