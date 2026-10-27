# Covo Web App

A restaurant ordering website for a fictional food brand, built with HTML, CSS, and JavaScript. The app includes a responsive restaurant landing page, a menu grid, cart functionality, and an admin section for adding, updating, and deleting menu items.

## Project Objectives

- Build a modern restaurant landing page with a menu and shopping cart
- Use a mock REST API to manage menu data
- Implement CRUD operations using JSON Server
- Keep JavaScript modular and maintainable
- Add admin login protection for menu management
- Provide a working frontend app using a deployed API endpoint

## Tech Stack

- HTML
- CSS
- JavaScript
- JSON Server
- Node.js

## Features

- Menu display with cards and pricing
- Add to cart and remove item actions
- Cart count and total pricing
- Admin login with username and password
- Admin CRUD menu management
- Error handling, validation, and user feedback
- Mobile-friendly layout

## Local Setup

1. Clone the project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the mock REST API (JSON Server) on `http://localhost:3001`:
   ```bash
   npm start
   ```
4. Serve `index.html` with a local static server such as VS Code Live Server. The app uses `http://localhost:3001` by default; set `window.COVO_CONFIG.API_BASE_URL` before loading the app to point to another API URL.

The mock API serves the menu stored in `db.json`. JSON Server exposes standard REST endpoints such as `GET /menu`, `POST /menu`, `PUT /menu/:id`, `PATCH /menu/:id`, and `DELETE /menu/:id`. Data changes are written to `db.json`.

If the menu API is unavailable, the site displays its bundled sample menu and shows an error message. The sample items are for display only; menu management requires the API to be running.

## Admin Login

- Username: admin
- Password: admin123

## Deployment
- I deployed through github page the url is below
https://peter-ht.github.io/covo-web-app/

- My figma link 
`https://www.figma.com/design/7I9reET0T04ElFdxGOrs80/Untitled?node-id=22-11&t=Arj2xa8oM3y0HTzG-1`


