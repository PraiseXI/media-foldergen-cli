# Creative Structure

A powerful tool by [Professionally Curious](https://www.professionallycurious.com) to automatically generate standardized folder structures for photo and video projects, supporting both client work and personal projects.

## 📖 Documentation
**[Complete Documentation →](https://creative-structure.vercel.app/docs.html)**

Our comprehensive documentation includes:
- 🚀 **Quick Start Guide** - Get up and running in minutes
- 💻 **Technical Reference** - Complete CLI command reference
- ❓ **FAQ & Troubleshooting** - Common issues and solutions
- ⬇️ **Installation Guide** - Multiple installation methods

## 🌐 Web Application
**New!** Use Creative Structure right in your browser - no installation required!

**[Launch Web App →](https://creative-structure.vercel.app/webapp/index.html)**

Perfect for users who prefer a visual interface or don't want to use the command line. Features include:
- ✨ **Intuitive step-by-step interface** 
- 👥 **Visual client management**
- 📱 **Mobile-friendly design**
- 💾 **Instant ZIP downloads**
- 🎨 **Real-time preview**

## 💻 Command Line Interface (CLI)
For power users and automation, the CLI provides the full feature set with scriptable commands.

## The Problem

As a photographer or videographer, you've probably experienced these frustrations:

**🗂️ Inconsistent Organization**
- Every project starts with the same tedious folder creation process
- Different folder structures across projects make files hard to find
- Manual folder creation is error-prone and time-consuming

**👥 Client Management Chaos**
- Retyping client names and creating duplicate folder structures
- No easy way to see what clients you've worked with
- Inconsistent naming conventions across client projects

**🎥 Multi-Camera Complexity**
- Managing footage from multiple cameras becomes a nightmare
- No standardized way to organize main, BTS, drone, and interview footage
- Hours wasted manually creating and naming camera-specific folders

**📁 Repetitive Setup**
- The same folder structure setup for every single project
- No intelligence about your existing folder organization
- Starting from scratch in new locations recreates entire directory trees

## Why This Tool Exists

**⚡ Speed Up Your Workflow**
- Generate complete project structures in seconds, not minutes
- Standardized layouts mean you always know where to find files
- Smart detection prevents duplicate work and folder creation

**🎯 Professional Consistency**
- Industry-standard folder structures that scale with your business
- Consistent naming conventions across all projects
- Organized structure that clients and collaborators can easily navigate

**🧠 Intelligent Automation**
- Automatically discovers existing clients from your folder structure
- Detects where you are in your project hierarchy and adapts accordingly
- Learns from your existing organization instead of fighting it

**📈 Scalable Organization**
- Built for both solo creators and growing studios
- Handles everything from simple personal projects to complex multi-camera commercial shoots
- Grows with your business without breaking your existing organization

Stop manually creating the same folders over and over. Start focusing on what you do best: creating amazing visual content.

## About Professionally Curious

This tool is developed by [Professionally Curious](https://www.professionallycurious.com), a company dedicated to creating innovative solutions for creative professionals. We understand the unique challenges faced by photographers and videographers, and we build tools that streamline workflows and enhance productivity.

Visit us at [www.professionallycurious.com](https://www.professionallycurious.com) to learn more about our other products and services.

## Features

- 📁 **Standardized Folder Structures** - Generate consistent folder layouts for photo and video projects
- 👥 **Client Management** - Store and reuse client information
- 🔍 **Automatic Client Discovery** - Automatically detects existing client folders and presents them as options
- 🎯 **Project Types** - Support for photo, video, or combined projects
- 📅 **Date-based Naming** - Automatic date formatting for project folders
- 🎨 **Interactive Mode** - User-friendly prompts for easy project creation
- 🧠 **Smart Path Detection** - Automatically detects existing folder structure and skips creating redundant folders
- 📹 **Multi-Camera Support** - Organize footage by camera and purpose (main-camera, BTS-secondary, etc.)
- ⚙️ **Configurable** - Customize folder structures and settings

## Recent Updates

### UI/UX Redesign (November 2025)
- 🎨 **Complete UI Overhaul**: Redesigned the entire web application with a modern, professional interface
  - New dark theme with sophisticated color palette using deep grays and accent colors
  - Enhanced typography with Inter font family for better readability
  - Improved visual hierarchy with better spacing and layout
  - Added subtle animations and micro-interactions for better user experience
  - Completely responsive design optimized for all screen sizes
  - Professional glassmorphism effects with backdrop blur
  - Custom button styles with hover animations and visual feedback

### Bug Fixes (July 2025)
- ✅ **Fixed Interactive Mode Errors**: Resolved critical bugs preventing camera setup in interactive mode
  - Fixed "name 'self' is not defined" error in client validation
  - Fixed "'NoneType' object has no attribute 'get'" error in camera setup menu
- 🎬 **Improved Camera Setup**: Enhanced error handling and user experience in multi-camera configuration

## Installation

> **📋 Source Code**: The CLI source code is available on [GitHub](https://github.com/PraiseXI/media-foldergen-cli) for installation and development.

### From Source
```bash
git clone https://github.com/PraiseXI/media-foldergen-cli.git
cd media-foldergen-cli
pip install -e .
```

### Using pip (when published)
```bash
pip install creative-structure-cli
```

## Quick Start

### Interactive Mode (Recommended)
```bash
structure-cli interactive
```

### Command Line Usage
```bash
# Create a client photography project
structure-cli create --type photo --work-type client --client "ABC Corp" --project "Product Shoot"

# Create a personal video project
structure-cli create --type video --work-type personal --project "Travel Documentary"

# List existing clients
structure-cli clients list

# Add a new client
structure-cli clients add "New Client Name"

# Setup Assets & Resources folder structure
structure-cli setup-assets

# Multi-camera video project
structure-cli create --type video --work-type client --client "ABC Corp" --project "Commercial" --cameras "main:camera1,BTS:camera2"

# View camera setup help
structure-cli cameras

# Disable smart path detection (always create full structure)
structure-cli create --type photo --work-type client --client "ABC Corp" --project "Product Shoot" --no-smart-path
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

## Configuration

The CLI creates a configuration file at `~/.sbp-generator/config.json` on first run. You can customize folder names and settings to match your existing structure.

### View Current Configuration
```bash
structure-cli config
```

### Common Configuration Changes

**Change Folder Names** (e.g., if you use "VIDEO" instead of "Videography"):
```bash
# Edit ~/.sbp-generator/config.json
{
  "base_directories": {
    "photography": "PHOTO",        // Your photo folder name
    "videography": "VIDEO",        // Your video folder name  
    "assets": "Assets & Resources"
  }
}
```

**Customize Subfolders**:
```bash
{
  "client_work_subfolder": "Client Work",     // or "Clients"
  "personal_work_subfolder": "Personal Work"  // or "Personal"
}
```

**Reset to Defaults**:
```bash
structure-cli reset-config
```

### Configuration File Location
- **File**: `~/.sbp-generator/config.json`
- **Note**: This file is automatically created and should be in your `.gitignore`

## Multi-Camera Support

For video projects, organize your footage by camera and purpose with intelligent folder naming:

### How It Works
- **Purpose-based organization**: `main`, `BTS`, `secondary`, `drone`, `interview`, `detail`, `backup`
- **Camera-specific folders**: Automatically creates `purpose-camera` folder structure
- **Applies to RAW and Proxies**: Camera folders created in both `Footage/RAW/` and `Footage/Proxies/` (if enabled)

### Setup Options

**Interactive Mode** (Recommended)
```bash
structure-cli interactive
# Follow prompts to set up cameras step-by-step
```

**Command Line**
```bash
# Single camera setup
--cameras "main:camera1"

# Multi-camera setup
--cameras "main:camera1,BTS:camera2,drone:camera3"

# Complex setup
--cameras "main:camera1,secondary:camera2,interview:camera3,BTS:camera4"
```

### Example Output Structure
```
VIDEO/Client Work/ABC Corp/2024-01-15-Commercial/
├── Footage/
│   ├── RAW/
│   │   ├── main-camera1/
│   │   ├── BTS-camera2/
│   │   └── drone-camera3/
│   └── Proxies/
│       ├── main-camera1/
│       ├── BTS-camera2/
│       └── drone-camera3/
├── Edited/
├── Deliverables/
└── ...
```