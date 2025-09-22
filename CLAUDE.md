# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a mobile-first shopping list web application built with vanilla HTML, CSS, and JavaScript. The app is a simple, lightweight client-side application with no build process or dependencies.

## Architecture

The application follows a class-based JavaScript architecture:

- **ShoppingList class** (`script.js:1-136`): Main application controller that manages the entire shopping list functionality
- **Data persistence**: Uses localStorage for client-side data storage
- **Event-driven**: Uses DOM event listeners for user interactions
- **Mobile-first design**: Responsive CSS with mobile breakpoints

### Key Components

- **HTML Structure** (`index.html`): Simple semantic HTML with container layout
- **Styling** (`styles.css`): Modern CSS with gradient backgrounds, responsive design, and smooth animations
- **JavaScript Logic** (`script.js`): Single class handling all functionality including:
  - Item management (add, toggle, delete)
  - Local storage persistence
  - DOM rendering and updates
  - Event binding

### Data Model

Items are stored as objects with:
- `id`: Timestamp-based unique identifier
- `text`: Item description (HTML-escaped)
- `completed`: Boolean completion status

## Development Commands

This project has no package.json or build process. To develop:

1. **Serve locally**: Use any static web server (e.g., `python -m http.server` or `npx serve`)
2. **Testing**: Manual testing in browser - no automated test framework
3. **Linting**: No formal linter configured - ensure vanilla JS/CSS/HTML standards

## Technical Notes

- No external dependencies or frameworks
- Uses modern JavaScript (ES6 classes, const/let, arrow functions)
- HTML escaping implemented for XSS protection (`script.js:122-126`)
- Responsive design with mobile-first approach
- Uses localStorage for data persistence (no server/database)