import client from './client';

export type PublishNewsPayload = {
  title: string;
  body: string;
  imageUri?: string;
};

export type NewsItem = {
  _id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  town: { _id: string; name: string; district: string; state: string };
  author: { name: string };
  createdAt: string;
};

export const publishNews = async ({ title, body, imageUri }: PublishNewsPayload) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('body', body);

  if (imageUri) {
    const filename = imageUri.split('/').pop() ?? 'image.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    formData.append('image', { uri: imageUri, name: filename, type: mimeType } as unknown as Blob);
  }

  return client.post<{ news: NewsItem }>('/api/news/publish', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
