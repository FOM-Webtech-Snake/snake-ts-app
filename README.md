# Snake Extreme

## Introduction

This project is a full-stack web application that combines `Phaser`, `Node.js`, `Express`, and `Socket.IO` to create an
interactive multiplayer game. The core of the project is a browser-based game powered by `Phaser`, a popular HTML5 game
framework, which provides rich, 2D game mechanics. The game is hosted on a `Node.js` backend, which handles real-time
communication between players via `Socket.IO`, enabling multiplayer functionality.

The project is designed with a modern development workflow, utilizing `TypeScript` for static typing and `Webpack` for
bundling and optimizing the client-side code. The backend is powered by `Express`, providing server-side API routes and
handling static file delivery, while also integrating `Socket.IO` for real-time game interactions.

## Purpose

The purpose of this project is to create an engaging and interactive multiplayer gaming experience where players can
connect in real-time, play, and interact with each other. By using `Webpack` for efficient bundling, `Socket.IO` for
real-time communication, and `Node.js` as the server, this project aims to provide a seamless and scalable solution for
browser-based multiplayer games.

## Breakdown of Key Folders and Files

* `public/`: This is where the static `assets` (images) and `css` (styles) are served from. The `templates` folder
  contains HTML-Templates. The `index.html` is the main HTML file for the client.

* `src/`: Holds all TypeScript source code for both client and server sides.
    * `client/`: Contains all client related code, where `/game` holds all Phaser-related code, it holds individual game
      `/scenes`, and Game.ts initializes the
      Phaser game. `index.tsx` is the main entry point for Webpack to compile the bundles and also the main entrypoit for
      a user visiting the App.
    * `server/`: Holds the server code, which includes setting up Express and Socket.IO. Key subdirectories include:
        * `controllers/`: Contains functions that handle specific game actions, managing game state, user events, etc.
        * `sockets/`: Organizes Socket.IO events, with socket.ts handling connection logic and event routing.
        * `routes/`: For RESTful API routes if the server needs additional API endpoints besides Socket.IO.

* `dist/`: Output directory for the transpiled TypeScript code for both the client and server. By keeping the compiled
  code separate from `src/`, the project remains clean and easier to deploy. All generated code in `/dist` is ignored by
  `.gitignore` and will never be pushed or commited to the repository.

### Supporting Files

* `.env`: Stores environment-specific variables. (e.g. PORT)
* `nodemon.json`: Configuration file for nodemon. Nodemon is a dev tool that automatically triggers the build for the
  project when something has been changed in the `/src`folder. Without this tool, the developer has to trigger the build
  and webpack process manually all the time something changes.
* `tsconfig.json`: TypeScript configuration file, with settings for include and exclude paths and configuring the
  compiler.
* `webpack.common.cjs`: Contains shared Webpack configuration for both development and production builds, specifying
  entry points, output, file handling, and plugins. This file centralizes shared configuration to avoid repetition in
  environment-specific configurations.
    * `webpack.dev.cjs`: Extends `webpack.common.cjs` with settings optimized for development, such as enabling source
      maps, using the development server, and setting the mode to development for faster builds.
    * `webpack.prod.cjs`: Extends `webpack.common.cjs` with production-specific settings and mode set to production to
      minimize output and enhance performance.
* `package.json`: Lists dependencies, scripts for building and running the project, and any useful developer tools.
* `Dockerfile`: Specifies instructions for building a Docker image for the app, including installing dependencies,
  building the project, and defining the final environment setup. This allows the app to run in isolated Docker
  containers consistently across environments.
* `docker-compose.yaml`: Defines the services for running the app in a multi-container setup, configuring networking,
  environment variables, and port mapping for each service. It enables one-command startup for local development or
  deployment with Docker Compose.

## Running The App

### Pre-requirements

Before running the application, ensure that the following tools are installed on your system:

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or later)
- [Docker Compose](https://docs.docker.com/compose/install/) (if you prefer using `docker-compose`)
- Web browser (to access the web app at `http://localhost:8081`)

Ensure that Docker is running and your environment is properly set up to build and run containers.

---

### Docker Run

```shell
docker build -t  snake-webapp .
docker run -p 8081:8081 snake-webapp
```

### (Alternative to Docker Run) Docker Compose

To use Docker Compose, execute the following command. Docker will automatically build and run the code.

```shell
docker compose up -d
```

After executing, just open a browser and visit http://localhost:8081.

## Links To Used Libraries

- **Phaser**: [https://phaser.io/](https://phaser.io/)
- **Socket.IO**: [https://socket.io/](https://socket.io/)
- **TypeScript**: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)
- **Webpack**: [https://webpack.js.org/](https://webpack.js.org/)
- **Node.js**: [https://nodejs.org/](https://nodejs.org/)  
- **Nodemon**: [https://nodemon.io/](https://nodemon.io/)