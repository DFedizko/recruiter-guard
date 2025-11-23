import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  profilePage?: boolean;
}

function getNameInitials(fullName?: string | null) {
  if (!fullName) return "";

  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "";

  const first = parts[0]?.[0]?.toUpperCase();
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0]?.toUpperCase() : undefined;

  if (first && last) return first + last;
  if (first) return first;
  return "";
}

export function Avatar({ src, alt, fallback, className, profilePage, ...props }: AvatarProps) {
  const isDataSrc = src?.startsWith('data:') || src?.startsWith('blob:');

  const content = src ? (
    isDataSrc ? (
      <img
        src={src}
        alt={alt || ''}
        className="h-full w-full object-cover rounded-full"
      />
    ) : (
      <Image
        src={src}
        alt={alt || ''}
        width={56}
        height={56}
        className="h-full w-full object-cover rounded-full"
      />
    )
  ) : (
    <span className={`${profilePage ? "text-2xl" : "text-sm"} font-semibold text-primary-foreground`}>
      {fallback ? getNameInitials(fallback) : "..."}
    </span>
  );

  return (
    <div
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary",
        profilePage && "h-14 w-14"
      )}
      {...props}
    >
      {content}
    </div>
  );
}
