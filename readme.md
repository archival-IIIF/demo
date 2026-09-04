<p align="center">
  <a href="https://material-ui.com/" rel="noopener" target="_blank"><img width="150" src="https://archival-iiif.github.io/logos/iiif.png" alt="Material-UI logo"></a>
</p>

<h1 align="center">Archival IIIF demo</h1>

<div align="center">
https://iiif.sozialarchiv.ch/?manifest=https://iiif.sozialarchiv.ch/iiif/collection/demo
</div>

![CI](https://github.com/archival-IIIF/demo/actions/workflows/ci.yml/badge.svg)

## Installation

1. Clone or download repository
2. Install dependencies
  ```sh
  # with pnpm
  pnpm install

  # with npm
  npm install
  ```
3. Copy env.example to .env and set port.
4. Start server
  ```sh
  # with pnpm
  pnpm dev

  # with npm
  npm run dev
  ```

## Docker

This project can also run in Docker.

1. Copy `env.example` to `.env` if you want to customize the port
2. Build and start the container:
   ```bash
   docker compose up --build
   ```
3. Open `http://localhost:3334`

To stop the container:

```bash
docker compose down
```

## License

This software is released under the MIT license.
