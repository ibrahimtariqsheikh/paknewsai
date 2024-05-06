"use client";
import Image from "next/image";
import { CloudMoon, MoonStar, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main className="grid grid-cols-12 py-8">
      <div className="col-span-1 border-r border-black/60 flex flex-row justify-center items-center">
        <p className="font-medium rotate-90 fle whitespace-nowrap tracking-wide text-4xl">
          NEWS FROM ALL OVER PAKISTAN
        </p>
      </div>
      <div className="flex flex-col px-10 gap-5 col-span-11">
        <section className="flex items-center justify-between">
          <div className="w-16 h-16 bg-black rounded-full relative">
            <div className="w-8 h-8 rounded-full bottom-2 right-2 bg-white absolute" />
          </div>
          <div className="flex items-center justify-center text-sm gap-1">
            <p className="text-sm">Pakistan</p>
            <CloudMoon className="w-5 h-5" />
            <p className="text-sm">26°C</p>
          </div>
          <div className="text-sm flex flex-col items-end">
            <p>News fetched from ----</p>
            <p>------- all over Pakistan</p>
          </div>
          <div>
            <Button
              variant={"default"}
              size={"lg"}
              className="text-sm"
              onClick={() => {
                router.push("/chat");
              }}
            >
              <div className="flex gap-2 items-center justify-center">
                <Newspaper className="w-4 h-4" />
                <p className="text-xs">Get Started Now</p>
              </div>
            </Button>
          </div>
        </section>
        <section className="flex gap-6 items-center justify-center border-y border-black/60 py-2">
          <div className="flex flex-col text-sm items-center">
            <p className="font-bold">Wednesday</p>
            <p>6th May 2024</p>
          </div>
        </section>

        <section className="flex gap-6 items-center justify-center border border-black/30 p-4">
          <div className="flex items-center text-3xl font-semibold gap-8 font-news">
            PAKNEWS.AI
          </div>
        </section>
        <section className="font-bold text-2xl">LATEST NEWS</section>
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-black/30 p-4 flex items-center justify-center flex-col  gap-2">
            <Image
              src="/slide2.jpg"
              alt="Pakistan"
              width={200}
              height={200}
              className="w-full"
            />
            <p className="text-sm text-center">
              IBA Students are the best students in the world. They are
              passionate about their studies and always want to learn more.
            </p>
          </div>
          <div className="border border-black/30 p-4 flex items-center justify-center flex-col gap-2">
            <Image
              src="/farmers.jpeg"
              alt="Pakistan"
              width={200}
              height={200}
              className="w-full"
            />
            <p className="text-sm text-center">
              Petrol Prices <span className="font-bold">Increased By 10%</span>{" "}
              in Pakistan.
            </p>
          </div>

          <div className="border border-black/30 p-4 flex items-center justify-center flex-col gap-2">
            <Image
              src="/imrankhan.webp"
              alt="Pakistan"
              width={200}
              height={200}
              className="w-full"
            />
            <p className="text-sm text-center ">
              Imran Khan is the Prime Minister of Pakistan. He is in prison at
              the moment. However, Pakistani&apos;s are upset about the
              situation.
            </p>
          </div>
        </section>
        <section className="font-bold text-2xl">JOIN NOW</section>
        <Button className="w-full py-8" onClick={() => router.push("/chat")}>
          <div className="flex gap-2 items-center justify-center">
            <Newspaper className="w-4 h-4" />
            <p className="text-sm">Get Started Now</p>
          </div>
        </Button>
      </div>
    </main>
  );
}
