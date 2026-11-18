import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import * as lorelei from "@dicebear/lorelei";
import type { Parent } from "../../domain/types";

const BACKGROUND: Record<Parent, string> = { Melissa: "ffd9cf", Jason: "c9efe9" };

interface AvatarProps {
  parent: Parent;
  size?: number;
  className?: string;
}

/**
 * Illustrated avatar for a parent, generated locally from the name (DiceBear
 * "Lorelei" style). Purely decorative: alt is empty so buttons keep their
 * accessible name ("Melissa", "Jason").
 */
export function Avatar({ parent, size = 36, className }: AvatarProps): React.ReactElement {
  const src = useMemo(
    () => createAvatar(lorelei, { seed: parent, backgroundColor: [BACKGROUND[parent]], radius: 50 }).toDataUri(),
    [parent],
  );
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`avatar avatar--${parent.toLowerCase()}${className ? ` ${className}` : ""}`}
    />
  );
}
