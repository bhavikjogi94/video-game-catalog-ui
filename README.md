# Video Game Catalog UI

This is the frontend client for the Video Game Catalog project. It's a modern, standalone Angular application built to browse, add, edit, and delete video games.

## Tech Stack
* **Framework:** Angular 21 (Standalone Components, no `NgModule`)
* **State Management:** Angular Signals (`signal`, `computed`, `effect`)
* **Styling & Components:** Bootstrap 5.3.8 with `ng-bootstrap`
* **HTTP:** Angular `HttpClient` wrapped in dedicated services for clean architecture

## Project Structure

```text
src/
├── app/
│   ├── core/
│   │   ├── data-access/              ← API HTTP Wrappers
│   │   │   ├── games.service.ts      
│   │   │   ├── genres.service.ts     
│   │   │   └── platforms.service.ts  
│   │   ├── interceptors/
│   │   │   └── error.interceptor.ts  ← Global HTTP Error Handler
│   │   └── services/
│   │       └── toast.service.ts      ← Notification Signal State
│   │
│   ├── models/                       ← TypeScript interfaces (DTOs)
│   │   ├── video-game.model.ts
│   │   ├── genre.model.ts
│   │   └── platform.model.ts
│   │
│   ├── pages/
│   │   ├── video-game-list/
│   │   │   └── video-game-list.component.ts   ← Page 1 (Game Table)
│   │   └── video-game-form/
│   │       └── video-game-form.component.ts     ← Page 2 (Reactive Form)
│   │
│   ├── shared/components/
│   │   └── toasts-container.component.ts
│   │
│   ├── app.routes.ts                 ← Eager / Lazy routing map
│   └── app.config.ts                 ← Root provider context
```

## Features & Architecture highlights

* **100% Standalone:** I decided not to use `AppModule` or any `NgModules`. Every component imports exactly what it needs directly, which keeps the bundle sizes small and the code extremely modern.
* **Signals Everywhere:** All the reactive state is managed using Signals instead of heavy RxJS Observables. This allowed me to remove `zone.js` and switch completely to **Zoneless Change Detection** (`provideZonelessChangeDetection()`), which makes the app incredibly fast and snappier.
* **Clean Data Access:** The components don't make HTTP calls directly. Instead, HTTP logic is decoupled into the `core/data-access` services layer.
* **Lazy Loading:** The "Browse" page loads instantly on startup, but the "Edit" page routes are fetched via dynamic lazy-loading `loadComponent` since users won't always need them immediately.
* **Global Error Handling:** I added a global `HttpInterceptor` that catches API failures or network drops. If the API returns a 404 or 500 error, instead of breaking the app, the interceptor parses the API's `ProblemDetails` message and triggers a nice, friendly Bootstrap Toast popup.

## Getting Started

### Prerequisites
* Node.js and npm installed
* Angular CLI (`npm install -g @angular/cli`)

### Running the App Locally

1. Make sure the backend API (`VideoGameCatalog.Api`) is running via IIS Express on port `44371` (`https://localhost:44371`). 
2. Open a terminal in this `video-game-catalog-ui` folder.
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the Angular development server:
   ```bash
   ng serve
   ```
5. Open your browser and navigate to `http://localhost:4200/`.

That's it! You should see the browse table populating with the seeded API games. Have fun!
