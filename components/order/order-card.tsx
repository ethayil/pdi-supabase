"use client";

import { EyeIcon, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ImageZoom } from "@/components/ui/image-zoom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formattedDate } from "@/utils/formatted-date";
import { getTrackingUrl } from "@/utils/tracking-url";
import type { OrderWithDetails } from "./order-list";

export function OrderCard({
  order,
  orgId,
}: {
  order: OrderWithDetails;
  orgId: string;
}) {
  const trackingUrl = getTrackingUrl({
    courier: order.courier,
    trackingNumber: order.trackingNumber,
    postcode: order.postcode,
  });

  return (
    <Card className="h-full flex flex-col p-4 gap-2 overflow-hidden group shadow-lg">
      <CardContent className="p-0 m-0 flex items-center justify-between gap-4">
        <div className="flex w-full items-center justify-betweens gap-12">
          <Popover>
            <PopoverTrigger
              nativeButton={false}
              render={
                <Avatar className="size-12">
                  <AvatarImage src={order.user?.image ?? ""} />
                  <AvatarFallback>
                    {order.user?.name?.slice(0, 2).toUpperCase() || "UN"}
                  </AvatarFallback>
                </Avatar>
              }
            ></PopoverTrigger>
            <PopoverContent align="start">
              <div className="">
                <p>{order.user?.name ?? "User doesn't exist"}</p>
                <p className="text-muted-foreground text-xs">
                  {order.user?.email ?? "---"}
                </p>
              </div>
            </PopoverContent>
          </Popover>

          <div className="">
            <p className="text-sm font-medium">{order.reference}</p>
            <p className="text-xs text-muted-foreground">
              {formattedDate(order.createdAt)}
            </p>
          </div>

          <div className="hidden sm:block">
            <p className="text-sm">{order.fullname}</p>
            <p className="text-xs text-muted-foreground">{order.email}</p>
          </div>
          <div className="hidden md:block">
            <p className="text-sm">{order.address1}</p>
            <p className="text-xs text-muted-foreground">
              {order.town}, {order.country}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </CardContent>
      <Separator />
      <div className="flex items-center justify-between gap-16 p-0 pl-12 m-0 mt-2">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full max-w-[calc(100%-120px)]"
        >
          <CarouselContent className="-ml-2">
            {order.items.map((item) => (
              <CarouselItem
                key={item.id}
                className="pl-2 basis-1/3 sm:basis-1/4 md:basis-1/6 lg:basis-1/8 xl:basis-1/10 relative"
              >
                <ImageZoom>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="relative size-16 cursor-zoom-in">
                        <Image
                          src={item.product?.imgUrl ?? "/placeholder.svg"}
                          alt={item.product?.name ?? "Product"}
                          fill
                          className="rounded-md object-cover transition-all group-hover/item:brightness-75"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>
                        <span className="font-bold text-primary">
                          {item.quantity}
                        </span>{" "}
                        x {item.product?.name}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </ImageZoom>
                <Badge
                  variant="outline"
                  className="absolute top-0 left-2 border-none shadow-xl bg-accent/50 text-xs! backdrop-blur-xl"
                >
                  {item.quantity}
                </Badge>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden sm:block">
            <CarouselPrevious className="-left-8" />
            <CarouselNext className="-right-8" />
          </div>
        </Carousel>
        <div className="flex flex-col gap-2 shrink-0">
          <Link href={`/${orgId}/orders/${order.id}`}>
            <Button variant="outline" size="sm">
              <EyeIcon className="size-4 mr-2" />
              View
            </Button>
          </Link>
          {order.trackingNumber &&
            order.courier !== "Collect" &&
            trackingUrl && (
              <Link
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Truck className="size-4 mr-2" />
                  Track
                </Button>
              </Link>
            )}
        </div>
      </div>
    </Card>
  );
}
