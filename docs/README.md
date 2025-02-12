---
label: "What is Linux React?"
icon: home
---

# Linux React

A web-based Linux distribution built with React, offering a modern desktop experience in your browser.

## Overview

Linux React is an experimental project that brings the Linux desktop experience to the web. It combines the power of Linux with the flexibility of web technologies to create a unique, accessible computing platform.

## Core Components

- 🖥️ **Desktop Environment**: A React-based desktop interface with window management and system controls
- 🚀 **System Installer**: Modern installation wizard for system setup and configuration
- 📦 **Package Management**: Web-based application installation and management
- 💾 **Virtual Filesystem**: Browser-based filesystem implementation
- 🔧 **System Settings**: Comprehensive system configuration interface

## Project Structure

- `/installer` - System installation wizard
- `/desktop` - Main desktop environment
- `/apps` - Core system applications
- `/system` - System utilities and services
- `/shared` - Shared components and utilities
- `/docs` - Documentation (WIP)

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **State Management**: Zustand
- **Storage**: IndexedDB, LocalStorage
- **Package Management**: Custom package format and manager

## Development Status

⚠️ This project is currently in early development. Many features are experimental and subject to change.

### Current Focus

- [X] Core system architecture
- [x] Installation wizard
- [X] Basic desktop environment
- [ ] Application framework
- [ ] Package management system

## Quick Start  

You can install Linux React API using `npm`, `pnpm` or `bun`. <br/>
<small style="color: gray;">Note: Other package managers should work fine, these are just the ones that have been tested.</small>

+++ NPM
```
npm install linux-react-api
linux-react start
```
+++ PNPM 
```
pnpm add linux-react-api
linux-react start
```
+++ Bun
```
bun add linux-react-api
linux-react start
```
+++


## Contributing

We welcome contributions! If you have any proposals to this, just create an issue on Github!

## Documentation

- [Architecture Overview](docs/architecture.md)
- [Development Guide](docs/development.md)
- [API Reference](docs/api/index.md)

## Community

- [Bug Reports](https://github.com/spaceofnova/linux-react/issues)

## License

This project is licensed under [MIT](LICENSE)

## Acknowledgments

- The Linux community
- React development team
- All our contributors 
- My friend Kai for tons of help and support