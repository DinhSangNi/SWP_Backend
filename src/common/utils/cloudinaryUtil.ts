export const extractPublicId = (url: string): string | null => {
  try {
    // Ví dụ URL: https://res.cloudinary.com/demo/image/upload/v1234567/folder/image-name.jpg
    const parts = url.split('/');
    const uploadIndex = parts.findIndex((part) => part === 'upload');
    const publicIdParts = parts.slice(uploadIndex + 1);
    const fileName = publicIdParts.pop() ?? '';

    const fileBaseName = fileName.split('.')[0];

    return [...publicIdParts, fileBaseName].join('/');
  } catch (e) {
    return null;
  }
};
