import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateProfileImage = async (name, userId) => {
  let createCanvas;
  try {
    const canvasModule = await import('canvas');
    createCanvas = canvasModule.createCanvas;
  } catch (err) {
    // If canvas module fails, return a UI Avatar URL directly
    const initial = encodeURIComponent(name?.charAt(0)?.toUpperCase() || 'U');
    return `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=200`;
  }

  const width = 200;
  const height = 200;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
    '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
    '#ff5722', '#795548', '#9e9e9e', '#607d8b'
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  context.fillStyle = randomColor;
  context.fillRect(0, 0, width, height);

  context.fillStyle = '#ffffff';
  context.font = 'bold 100px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const initial = name.charAt(0).toUpperCase();
  context.fillText(initial, width / 2, height / 2);

  const buffer = canvas.toBuffer('image/png');

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'profileImages', public_id: userId.toString(), overwrite: true },
      (error, result) => {
        if (error) {
          resolve(`https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=random&color=fff&size=200`);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    stream.end(buffer);
  });
};

export default { generateProfileImage };
