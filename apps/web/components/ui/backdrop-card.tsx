"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface BackdropCardProps {
  children: React.ReactNode;
  imageSrc: string;
  imageAlt?: string;
  className?: string;
  cardClassName?: string;
  rootClassName?: string;
  imageClassName?: string;
}

export function BackdropCard({
  children,
  imageSrc,
  imageAlt = "Background",
  rootClassName,
  className,
  cardClassName,
  imageClassName,
}: BackdropCardProps) {
  const { displayedImage, nextImage, showNext, handleTransitionEnd } =
    useCrossfadeImage(imageSrc);
  return (
    <div className={cn("relative h-full overflow-hidden", rootClassName)}>
      <ScrollArea className="h-full relative">
        <Image
          src={displayedImage}
          alt={imageAlt}
          width={1000}
          height={1000}
          className={cn(
            "w-full absolute top-0 left-0 h-full rounded-xl object-cover",
            imageClassName,
          )}
        />
        {nextImage && (
          <Image
            src={nextImage}
            alt={imageAlt}
            width={1000}
            height={1000}
            onTransitionEnd={handleTransitionEnd}
            className={cn(
              "w-full absolute top-0 left-0 h-full rounded-xl object-cover transition-opacity duration-500",
              showNext ? "opacity-100" : "opacity-0",
              imageClassName,
            )}
          />
        )}
        <div
          className={cn(
            "grid place-items-start px-6 sm:px-10 max-w-3xl 2xl:max-w-6xl mx-auto",
            className,
          )}
        >
          <div className="w-full">
            <div className={cn("relative p-3", cardClassName)}>
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-card/60 backdrop-blur-lg" />
              <div className="relative">{children}</div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function useCrossfadeImage(imageSrc: string) {
  const [displayedImage, setDisplayedImage] = useState(imageSrc);
  const [nextImage, setNextImage] = useState<string | null>(null);
  const [showNext, setShowNext] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (imageSrc !== displayedImage && imageSrc !== nextImage) {
      setNextImage(imageSrc);
      // Small delay to ensure the new image element is rendered before transitioning
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShowNext(true);
        });
      });
    }
  }, [imageSrc, displayedImage, nextImage]);

  const handleTransitionEnd = () => {
    if (showNext && nextImage) {
      setDisplayedImage(nextImage);
      setNextImage(null);
      setShowNext(false);
    }
  };

  return {
    displayedImage,
    nextImage,
    showNext,
    handleTransitionEnd,
  };
}
