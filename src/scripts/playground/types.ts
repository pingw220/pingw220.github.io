import type * as THREE from 'three';

export type WorldId = 'market' | 'studio' | 'writing' | 'library' | 'theater' | 'station' | 'sports' | 'postoffice';

/**
 * Something Mochi can walk up to and use:
 *  - enter:   a market stall that leads into another world
 *  - exit:    the door back to the market
 *  - item:    one thing to look at (a book, a poster, a video, a letter…)
 *  - station: a spot that opens a list (e.g. a listening station for a playlist)
 */
export interface Interactable {
  id: string;
  kind: 'enter' | 'exit' | 'item' | 'station';
  label: string;
  emoji?: string;
  /** Where Mochi stands to use it. */
  front: THREE.Vector3;
  /** Which way Mochi faces when using it (radians, y-rotation). */
  facing: number;
  /** Meshes that can be clicked. */
  hits: THREE.Object3D[];
  /** Shows a "visit" prompt when Mochi is close (false = click only). */
  proximity?: boolean;
  setNear?(near: boolean): void;
  update?(t: number): void;
  /** Handled inside the 3D world (e.g. launching fireworks) instead of by the page. */
  activate?(): void;
  /** Seconds to tilt the camera up at the sky after activating (fireworks). */
  skyLook?: number;
}

export interface World {
  id: WorldId;
  scene: THREE.Scene;
  /** Walkable rectangle on the ground (x/z). */
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  /** Furniture Mochi can't walk through (x/z rectangles); Mochi slides along their edges. */
  obstacles?: { minX: number; maxX: number; minZ: number; maxZ: number }[];
  spawn: THREE.Vector3;
  spawnFacing: number;
  camera: { back: number; up: number; lookAhead: number; lookY: number; followX: number };
  bloom?: { strength: number; radius: number; threshold: number };
  items: Interactable[];
  update(t: number, dt: number): void;
}

/** Content shown in the worlds, already translated for the current page. */
export interface PlaygroundData {
  lang: 'en' | 'zh';
  stalls: { id: Exclude<WorldId, 'market'>; label: string; emoji: string; color: string; side: -1 | 1; z: number }[];
  music: { title: string; videos: { id: string; title: string; detail: string; date?: string }[] }[];
  novels: LibraryCard[];
  anime: LibraryCard[];
  travel: LibraryCard[];
  sports: LibraryCard[];
  /** Public guestbook messages (loaded live from the visitor API). */
  messagesApi: string;
  posts: { title: string; description: string; date: string; href: string }[];
  strings: Record<string, string>;
}

export interface LibraryCard {
  title: string;
  /** Author, studio, or place. */
  subtitle?: string;
  note?: string;
  date?: string;
  link?: string;
  image?: string;
  imageCredit?: { text: string; href?: string };
  rating?: number;
  love?: number;
  category?: string;
  review?: string;
  lat?: number;
  lon?: number;
  home?: boolean;
}
