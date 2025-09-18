// app/firebase/functions.ts
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export interface Video {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed";
  title?: string;
  description?: string;
}

// Define callable functions with input/output types
const generateUploadUrlFunction = httpsCallable<
  { fileExtension: string }, // input type
  { url: string }            // output type
>(functions, "generateUploadUrl");

const getVideosFunction = httpsCallable<
  void,     // input type
  Video[]   // output type
>(functions, "getVideos");

// Upload video
export async function uploadVideo(file: File) {
  const response = await generateUploadUrlFunction({
    fileExtension: file.name.split(".").pop()!, // `!` since split().pop() can return undefined
  });

  // Upload to signed URL
  const uploadResult = await fetch(response.data.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  return uploadResult;
}

// Get videos
export const getVideos = async () => {
  const response = await getVideosFunction();
  return response.data as Video[];
};
