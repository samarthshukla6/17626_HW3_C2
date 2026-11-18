import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import * as lorelei from "@dicebear/lorelei";
import type { Options as LoreleiOptions } from "@dicebear/lorelei";
import type { Options as CoreOptions } from "@dicebear/core";
import type { Parent } from "../../domain/types";

type AvatarOptions = Partial<LoreleiOptions & CoreOptions>;

// Fixed features so each parent always looks the same and matches the
// people in the interviews: Melissa with long hair and earrings, Jason with
// short hair and a beard. Illustrations only, of no real person.
const BASE: AvatarOptions = {
  mouth: ["happy02"],
  eyes: ["variant04"],
  eyebrows: ["variant05"],
  glassesProbability: 0,
  hairAccessoriesProbability: 0,
  frecklesProbability: 0,
  radius: 50,
};
const LOOK: Record<Parent, AvatarOptions> = {
  Melissa: {
    hair: ["variant35"],
    hairColor: ["6b3a26"],
    earrings: ["variant01"],
    earringsColor: ["d4a24c"],
    earringsProbability: 100,
    beardProbability: 0,
    backgroundColor: ["ffd9cf"],
  },
  Jason: {
    hair: ["variant08"],
    hairColor: ["2b2b2b"],
    beard: ["variant02"],
    beardProbability: 100,
    earringsProbability: 0,
    backgroundColor: ["c9efe9"],
  },
};

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
    () => createAvatar(lorelei, { ...BASE, ...LOOK[parent], seed: parent }).toDataUri(),
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
