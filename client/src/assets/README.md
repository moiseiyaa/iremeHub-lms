# Assets Folder

This folder contains external files used throughout the application.

## Structure

- **images/**: Contains image files (jpg, png, svg, etc.)
- **videos/**: Contains video files
- **documents/**: Contains document files (pdf, docx, etc.)

## Usage

Import assets from this folder as needed in your components:

```jsx
import myImage from '../src/assets/images/my-image.png';

function MyComponent() {
  return <img src={myImage} alt="My Image" />;
}
```

Please maintain the organization by placing files in their appropriate subdirectories. 