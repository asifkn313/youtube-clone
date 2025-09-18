"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VideoPlayer() {
  const searchParams = useSearchParams();
  const videoSrc = searchParams.get("v");
  const videoPrefix =
    "https://storage.googleapis.com/asif-yt-processed-videos/";

  return <video controls src={`${videoPrefix}${videoSrc}`} />;
}

export default function Watch() {
  return (
    <div className="ml-5">
      <p className="text-4xl font-bold mb-4">Watch Page</p>
      <Suspense fallback={<div>Loading video...</div>}>
        <VideoPlayer />
      </Suspense>
    </div>
  );
}
