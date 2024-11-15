// lib/storage.ts
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { getMetadata } from 'firebase/storage';

// Cache for URL to hash mapping to avoid unnecessary lookups
const urlHashCache = new Map<string, string>();

// Function to calculate file hash
async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Function to extract hash from filename
function extractHashFromFilename(filename: string): string | null {
  const match = filename.match(/-([a-f0-9]{64})-/);
  return match ? match[1] : null;
}

// Function to check if image already exists for user
async function findExistingImage(userId: string, fileHash: string): Promise<string | null> {
  try {
    // First check if we have a cached URL for this hash
    for (const [url, hash] of urlHashCache.entries()) {
      if (hash === fileHash) {
        // Verify the URL is still valid
        try {
          await getDownloadURL(ref(storage, url));
          return url;
        } catch {
          urlHashCache.delete(url);
        }
      }
    }

    // If not in cache, search in storage
    const userPetsRef = ref(storage, `pets/${userId}`);
    const filesList = await listAll(userPetsRef);
    
    for (const item of filesList.items) {
      const hash = extractHashFromFilename(item.name);
      if (hash === fileHash) {
        const url = await getDownloadURL(item);
        urlHashCache.set(url, fileHash);
        return url;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking existing image:', error);
    return null;
  }
}

export async function uploadPetImage(file: File, userId: string): Promise<string> {
  try {
    // Calculate file hash
    const fileHash = await calculateFileHash(file);
    
    // Check if this image already exists
    const existingUrl = await findExistingImage(userId, fileHash);
    if (existingUrl) {
      console.log('Reusing existing image');
      return existingUrl;
    }

    // If no existing image found, proceed with upload
    const timestamp = Date.now();
    const uniqueFilename = `pets/${userId}/${timestamp}-${fileHash}-${file.name}`;
    const storageRef = ref(storage, uniqueFilename);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Cache the new URL and hash
    urlHashCache.set(downloadURL, fileHash);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deletePetImage(imageUrl: string): Promise<void> {
  try {
    // Remove from cache first
    urlHashCache.delete(imageUrl);

    // Then delete from storage
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}