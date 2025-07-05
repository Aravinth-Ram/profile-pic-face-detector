# Profile Pic Face Detector

A ReactJS app for uploading and validating human profile pictures. Only images with a single human face are accepted. After upload, the face is centered and displayed. Uses normal CSS for styling. Prioritizes code readability and optimization.

## Features

- Upload a profile picture (JPG/PNG, max 5MB)
- Only accepts images with a single human face
- Rejects images with no face, multiple faces, or non-human subjects (animals, objects, etc.)
- After upload, redirects to a page showing the face-centered crop
- Modern, clean UI with normal CSS

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Notes

- Face detection uses [face-api.js](https://github.com/justadudewhohacks/face-api.js). You must provide the required models in the `public/models` directory. Download from the [face-api.js model repo](https://github.com/justadudewhohacks/face-api.js-models) and place them in `public/models`.
- This project uses normal CSS for styling (no CSS-in-JS).

## License

MIT
