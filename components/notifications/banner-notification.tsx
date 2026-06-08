"use client";

import { ChevronLeft, ChevronRight, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Banner } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { getVisibleBanners } from "@/data/notification-banner";
import { cn } from "@/lib/utils";
import { useBannerStore } from "@/store/use-banner-store";

const BANNER_THEMES: Record<string, string> = {
  midnight: "bg-indigo-950 text-indigo-50 border-indigo-900",
  sunset:
    "bg-linear-to-r from-orange-500 to-pink-500 text-orange-900 dark:text-orange-100 border-orange-800",
  ocean:
    "bg-linear-to-r from-blue-500 to-cyan-500 text-sky-900 dark:text-blue-100 border-blue-800",
  emerald:
    "bg-linear-to-r from-emerald-500 to-green-500 text-emerald-900 dark:text-emerald-100 border-emerald-800",
  violet:
    "bg-linear-to-r from-violet-500 to-purple-800 text-violet-900 dark:text-violet-100 border-violet-800",
  fire: "bg-linear-to-r from-red-500 to-rose-500 text-red-900 dark:text-red-100 border-red-800",
};

interface BannerNotificationProps {
  orgId?: string;
}

export function BannerNotification({ orgId }: BannerNotificationProps) {
  const [api_carousel, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { dismissedIds, dismissBanner } = useBannerStore();

  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    setMounted(true);
    getVisibleBanners({ orgId }).then(setBanners).catch(console.error);
  }, [orgId]);

  useEffect(() => {
    if (!api_carousel) return;
    setCurrent(api_carousel.selectedScrollSnap() + 1);
    api_carousel.on("select", () => {
      setCurrent(api_carousel.selectedScrollSnap() + 1);
    });
  }, [api_carousel]);

  if (!mounted || !banners || banners.length === 0) return null;

  const visibleBanners =
    banners?.filter((b) => !dismissedIds.includes(b.id)) ?? [];

  if (visibleBanners.length === 0) return null;

  return (
    <div
      key={visibleBanners.length}
      className="border-b overflow-hidden transition-all duration-300"
    >
      <Carousel
        setApi={setApi}
        className="w-full group relative"
        opts={{ loop: true }}
      >
        <CarouselContent>
          {visibleBanners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div
                className={cn(
                  "flex items-center justify-between px-12 py-2.5 min-h-[44px] relative transition-colors duration-500",
                  BANNER_THEMES[banner.variant] || BANNER_THEMES.midnight,
                )}
              >
                <div className="flex-1 flex items-center justify-start gap-2 font-medium text-sm tracking-tight">
                  <Info className="w-4 h-4 opacity-70 shrink-0" />
                  <span className="line-clamp-1">{banner.content}</span>
                </div>

                {banner.dismissible && (
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-6 text-current opacity-40 hover:opacity-100 hover:bg-current/10 transition-all rounded-full z-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissBanner(banner.id);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {visibleBanners.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-300 md:opacity-50 group-hover:opacity-80 hover:opacity-100 opacity-100 size-8 text-current hover:bg-current/5 rounded-md bg-current/20 md:bg-current/10"
              onClick={(e) => {
                e.stopPropagation();
                api_carousel?.scrollPrev();
              }}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-10 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-300 md:opacity-50 group-hover:opacity-80 hover:opacity-100 opacity-100 size-8 text-current hover:bg-current/5 rounded-md bg-current/20 md:bg-current/10"
              onClick={(e) => {
                e.stopPropagation();
                api_carousel?.scrollNext();
              }}
            >
              <ChevronRight className="size-4" />
            </Button>

            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-20 group-hover:opacity-40 flex gap-1 z-20">
              {visibleBanners.map((_, i) => (
                <button
                  type="button"
                  // biome-ignore lint/suspicious/noArrayIndexKey:False Positive
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    api_carousel?.scrollTo(i);
                  }}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    current === i + 1
                      ? "w-4 bg-current"
                      : "w-1 bg-current/30 hover:bg-current/50",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </Carousel>
    </div>
  );
}
