import { covers, jamCovers } from "./artwork.js";

export const games = [
  { id: "neon-drift", title: "Neon Drift", creator: "Mira Kwon", genre: "Arcade", description: "Thread a glowing ribbon through a city that never sits still. One more run is always one run away.", plays: "24.8k", rating: "4.9", time: "5 min", colors: ["#fa5a5a", "#ffb84a"], art: "sunset", image: covers["neon-drift"], featured: true, tags: ["Quick play", "High score"] },
  { id: "mosslight", title: "Mosslight", creator: "Fern Studio", genre: "Adventure", description: "Follow a tiny lantern spirit through a forest waking up after a very long winter.", plays: "18.2k", rating: "4.8", time: "12 min", colors: ["#478d6c", "#b0d574"], art: "forest", image: covers.mosslight, tags: ["Atmospheric", "Exploration"] },
  { id: "orbit-oddity", title: "Orbit Oddity", creator: "junebug", genre: "Puzzle", description: "Bend gravity, line up the little planets, and get every astronaut home.", plays: "15.6k", rating: "4.7", time: "8 min", colors: ["#5552bd", "#b4a4ff"], art: "orbit", image: covers["orbit-oddity"], tags: ["Brain teaser", "Relaxing"] },
  { id: "tiny-tactics", title: "Tiny Tactics", creator: "Pocket Tactics", genre: "Strategy", description: "A whole battlefield, a handful of moves. Make every tiny decision count.", plays: "12.1k", rating: "4.8", time: "10 min", colors: ["#c75e47", "#f0bd78"], art: "tactics", image: covers["tiny-tactics"], tags: ["Turn-based", "Tactical"] },
  { id: "cloud-hop", title: "Cloud Hop Club", creator: "lulu loops", genre: "Platformer", description: "Bounce between soft little clouds and collect the stars they leave behind.", plays: "9.7k", rating: "4.6", time: "6 min", colors: ["#568ab9", "#b0e6e8"], art: "cloud", image: covers["cloud-hop"], tags: ["Feel-good", "Platformer"] },
  { id: "night-market", title: "Night Market", creator: "Studio Soba", genre: "Simulation", description: "Open a tiny noodle stall, meet your neighbors, and make the perfect bowl.", plays: "8.9k", rating: "4.9", time: "15 min", colors: ["#913e59", "#f0a65a"], art: "market", image: covers["night-market"], tags: ["Cozy", "Story rich"] },
  { id: "paper-racer", title: "Paper Racer", creator: "foldedpixel", genre: "Racing", description: "Fold your way to the finish in this pocket-sized paper grand prix.", plays: "7.4k", rating: "4.5", time: "4 min", colors: ["#397778", "#bddb92"], art: "racer", image: covers["paper-racer"], tags: ["Arcade", "Fast"] },
  { id: "soft-reset", title: "Soft Reset", creator: "Aster Bloom", genre: "Casual", description: "Tidy a little moon garden and watch the constellations rearrange themselves.", plays: "6.3k", rating: "4.8", time: "7 min", colors: ["#716197", "#e9b8d4"], art: "moon", image: covers["soft-reset"], tags: ["Cozy", "No pressure"] },
  { id: "deep-blue", title: "Deep Blue, Deep Space", creator: "low orbit", genre: "Adventure", description: "A slow dive into an ocean no map has ever been able to hold.", plays: "5.8k", rating: "4.7", time: "11 min", colors: ["#205481", "#61c5c5"], art: "deep", image: covers["deep-blue"], tags: ["Discovery", "Atmospheric"] },
  { id: "little-planet", title: "Little Planet Fixers", creator: "elio", genre: "Puzzle", description: "Rotate a tiny world until every wandering river finds its way home.", plays: "4.1k", rating: "4.6", time: "9 min", colors: ["#b27745", "#e4d58b"], art: "planet", image: covers["little-planet"], tags: ["Puzzle", "Short"] }
];

export const genres = ["All games", "Arcade", "Puzzle", "Adventure", "Strategy", "Platformer", "Simulation", "Casual", "Racing"];

export const jams = [
  { title: "Small Worlds, Big Feelings", state: "LIVE NOW", days: "6 days left", entries: 124, color: "jam-lilac", icon: "sparkles", image: jamCovers["small-worlds"] },
  { title: "One Button Wonder", state: "STARTS SOON", days: "Begins Dec 02", entries: 0, color: "jam-peach", icon: "play", image: jamCovers["one-button"] },
  { title: "After the Last Star", state: "UPCOMING", days: "Begins Dec 14", entries: 0, color: "jam-blue", icon: "sparkles", image: jamCovers["last-star"] }
];

export const creators = [
  { name: "Mira Kwon", handle: "@miramakes", bio: "Small games for big feelings.", games: 8, initials: "MK", tint: "avatar-coral" },
  { name: "Fern Studio", handle: "@fernstudio", bio: "A little more wonder, every day.", games: 12, initials: "FS", tint: "avatar-green" },
  { name: "junebug", handle: "@junebug", bio: "Puzzles with a soft spot for space.", games: 5, initials: "jb", tint: "avatar-lilac" }
];
