import { cn } from "@/lib/utils";
import Image from "next/image";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
}

function getNameInitials(fullName: string | undefined) {
  const namesSplitted = fullName?.split(" ");
  const firstNameLatter = namesSplitted?.[0]?.[0]?.toUpperCase();
  const lastNameLatter = namesSplitted?.[namesSplitted.length]?.[0]?.toUpperCase();

  if (firstNameLatter && lastNameLatter) return firstNameLatter + lastNameLatter;

  return "";
}

export function Avatar({ src, alt, fallback, className, ...props }: AvatarProps) {
  const content = src ? (
    <Image
      src={src}
      alt={alt || ''}
      className="h-full w-full object-cover rounded-full"
    />
  ) : (
    <span className="text-sm font-semibold text-primary-foreground">
      {getNameInitials(fallback) || ""}
    </span>
  );

  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary",
        className
      )}
      {...props}
    >
      {content}
    </span>
  );
}

