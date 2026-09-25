import {
  Waves, Dumbbell, ShieldCheck, Zap, Droplet, Wind, Home,
  Sofa, Video, Fence, Trees, Wifi, Flame, UtensilsCrossed, DoorOpen,
  Sparkles, Sun, ParkingSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Maps common amenity strings (case-insensitive, partial match) to a lucide icon. */
const AMENITY_ICON_RULES: { match: RegExp; icon: LucideIcon }[] = [
  { match: /swimming|pool/i, icon: Waves },
  { match: /gym|fitness/i, icon: Dumbbell },
  { match: /security|guard/i, icon: ShieldCheck },
  { match: /generator|backup power|inverter/i, icon: Zap },
  { match: /borehole|water/i, icon: Droplet },
  { match: /air condition|\bac\b/i, icon: Wind },
  { match: /parking|garage/i, icon: ParkingSquare },
  { match: /boys.? quarters|bq\b/i, icon: Home },
  { match: /furnished/i, icon: Sofa },
  { match: /cctv|camera/i, icon: Video },
  { match: /gated/i, icon: Fence },
  { match: /garden|trees|landscap/i, icon: Trees },
  { match: /wifi|internet/i, icon: Wifi },
  { match: /gas|cooker|kitchen/i, icon: UtensilsCrossed },
  { match: /fireplace|heating/i, icon: Flame },
  { match: /balcony|terrace|patio/i, icon: DoorOpen },
  { match: /solar/i, icon: Sun },
];

export function getAmenityIcon(label: string): LucideIcon {
  const rule = AMENITY_ICON_RULES.find((r) => r.match.test(label));
  return rule ? rule.icon : Sparkles;
}
