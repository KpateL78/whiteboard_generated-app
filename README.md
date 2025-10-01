# EdgeDraw

A minimalist, high-performance virtual whiteboard for creating beautiful, hand-drawn style diagrams and sketches.

[cloudflarebutton]

## Key Features

- **Intuitive Drawing Tools**: Effortlessly create diagrams with tools like Rectangle, Ellipse, Line, Arrow, Free-draw, and Text.
- **Hand-Drawn Aesthetic**: All shapes are rendered with a sketchy, imperfect style, thanks to Rough.js.
- **Object Manipulation**: Full control over elements including selection, movement, resizing, and rotation.
- **Contextual Styling**: A dynamic properties panel allows for deep customization of stroke, fill, roughness, and more.
- **Infinite Canvas**: Pan and zoom on an infinite canvas to give your ideas space to grow.
- **State Management**: Robust state handling with Undo/Redo support powered by Zustand.
- **High Performance**: Built on Cloudflare's edge network for a lightning-fast and responsive user experience.
- **Export Options**: Save your creations as high-quality PNG or SVG files.

## Technology Stack

- **Framework**: React (with Vite)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React
- **State Management**: Zustand & Immer
- **Drawing Engine**: Rough.js & perfect-freehand
- **Animation**: Framer Motion
- **Deployment**: Cloudflare Workers

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/edgedraw.git
    cd edgedraw
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Run the development server:**
    ```bash
    bun run dev
    ```

The application will be available at `http://localhost:3000`.

## Usage

Once the application is running, you can immediately start drawing on the canvas.

- **Select a tool** from the toolbar at the top of the screen.
- **Click and drag** on the canvas to create a shape.
- **Use the 'Select' tool** to move or resize existing shapes.
- When a shape is selected, a **properties panel** will appear, allowing you to customize its appearance.
- Use the buttons in the corners for actions like **Undo/Redo**, **Zoom**, and **Clearing the canvas**.

## Development

The core logic of the application is organized as follows:

-   `src/pages/HomePage.tsx`: The main application component that assembles the UI.
-   `src/components/EdgeDrawCanvas.tsx`: The central canvas component handling all drawing and user interactions.
-   `src/components/Toolbar.tsx`: The top toolbar for tool selection.
-   `src/components/PropertiesPanel.tsx`: The contextual panel for styling selected elements.
-   `src/store/useDrawStore.ts`: The Zustand store managing the entire application state.
-   `src/lib/types.ts`: Contains all TypeScript type definitions for the application.

## Deployment

This project is optimized for deployment on the Cloudflare network.

### One-Click Deploy

You can deploy this application to your own Cloudflare account with a single click.

[cloudflarebutton]

### Manual Deployment via Wrangler

1.  **Login to Cloudflare:**
    ```bash
    wrangler login
    ```

2.  **Build the project:**
    ```bash
    bun run build
    ```

3.  **Deploy to Cloudflare Workers:**
    ```bash
    bun run deploy
    ```

Wrangler will handle the process of uploading your application and making it live.