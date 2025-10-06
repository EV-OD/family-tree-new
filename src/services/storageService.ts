/**
 * Storage service adapter for image uploads
 * Calls the standalone upload server instead of Firebase Storage
 */

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export interface UploadResult {
  url: string;
  key: string;
  name: string;
  size: number;
}

/**
 * Upload a photo to the server (which uses UploadThing)
 * @param file - The file to upload
 * @returns Upload result with url and key
 */
export async function uploadPhotoToServer(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await fetch(`${SERVER_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `Upload failed with status ${response.status}`);
  }

  return await response.json();
}

/**
 * Delete a photo from the server
 * @param key - The file key returned from upload
 */
export async function deletePhotoFromServer(key: string): Promise<void> {
  if (!key) {
    console.warn('No key provided for deletion');
    return;
  }

  const response = await fetch(`${SERVER_URL}/api/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Delete failed' }));
    throw new Error(error.error || `Delete failed with status ${response.status}`);
  }
}

/**
 * Check if the server is healthy
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
}
