import Link from "next/link";
import { getVideos } from "./firebase/functions";
import Image from "next/image";

export default async function Home() {
   const videos = await getVideos();

  return (
    <main className="flex flex-wrap">
      {videos.filter(video => video.filename !== undefined).map((video) => (
        <Link
          key={video.id}
          href={`/watch?v=${video.filename}`}
        >
          <Image
            src={"/thumbnail.png"}
            alt="video"
            width={120}
            height={80}
            className="m-2.5"
          />
        </Link>
      ))}
    </main>
  );
}

export const revalidate = 30;
