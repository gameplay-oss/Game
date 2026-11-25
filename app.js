import { games, genres, jams, creators } from "./data.js";

const app = document.querySelector("#app");
const state = {
  route: "discover",
  filter: "All games",
  query: "",
  sort: "Recommended",
  player: { running: false, paused: false, score: 0, x: 50 },
  generation: null,
  generationTimer: null,
};
let lastRenderedRoute = "";

const readStore = (key, fallback = []) => {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
};
const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const savedIds = () => readStore("arcade-atlas:saved", []);
const playedIds = () => readStore("arcade-atlas:played", []);
const drafts = () => readStore("arcade-atlas:drafts", []);
const currentRoute = () => location.hash.replace(/^#\/?/, "") || "discover";
const setRoute = (route) => { location.hash = `/${route}`; };
const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const findGame = (id) => games.find((game) => game.id === id);
const icon = (name, className = "") => `<i class="hgi-stroke hgi-${name} ${className}" aria-hidden="true"></i>`;
const art = (game, label = "") => `<span class="game-art art-${game.art} has-image" role="img" aria-label="${escapeHTML(game.title)} game artwork"><img src="${game.image}" alt="" loading="lazy" decoding="async"/>${label ? `<span class="art-label">${label}</span>` : ""}</span>`;
const toast = (message) => {
  const region = document.querySelector("#toasts");
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  region.append(node);
  window.setTimeout(() => node.remove(), 3000);
};

function navLink(route, label, iconName, active = false) {
  return `<a class="nav-link ${active ? "active" : ""} ${route === "create" ? "create-link" : ""}" href="#/${route}"><span class="nav-icon">${icon(iconName)}</span>${label}</a>`;
}

function shell(content) {
  const route = state.route;
  const navKey = route.startsWith("detail/") || route.startsWith("play/") ? "discover" : route;
  const sectionName = ({ discover: "Discover", search: "Search games", jam: "More games", create: "Create", studio: "Creator studio", library: "Your library", creator: "Creator profile" })[navKey] || "Discover";
  return `<div class="layout">
    <aside class="sidebar" aria-label="Main navigation">
      <a class="brand" href="#/discover"><span class="brand-mark">${icon("sparkles")}</span><span>ARCADE ATLAS<small>GAMES WORTH GETTING LOST IN</small></span></a>
      <p class="nav-label">Explore</p><nav class="nav-list">
        ${navLink("discover", "Discover", "home-01", navKey === "discover")}
        ${navLink("search", "Search games", "search-01", navKey === "search")}
        ${navLink("jam", "More games", "game-controller-03", navKey === "jam")}
      </nav>
      <p class="nav-label">Make & play</p><nav class="nav-list">
        ${navLink("create", "Create a game", "add-01", navKey === "create")}
        ${navLink("library", "Your library", "bookmark-01", navKey === "library")}
        ${navLink("studio", "Creator studio", "dashboard-browsing", navKey === "studio")}
      </nav>
      <div class="sidebar-spacer"></div>
      <a href="${games[0].url}" target="_blank" rel="noopener noreferrer" class="jam-callout"><span class="eyebrow">${icon("sparkles")} FEATURED ON FIFTH DOOR</span><strong>${escapeHTML(games[0].title)}</strong><p>${escapeHTML(games[0].description)}</p><span class="text-link">Play now ${icon("arrow-up-right-01")}</span></a>
      <div class="sidebar-user"><span class="avatar">AJ</span><span><strong>Alex Johnson</strong><small>Player profile · Demo</small></span><button class="icon-button" data-action="profile" aria-label="Open creator profile">${icon("more-horizontal")}</button></div>
    </aside>
    <main class="main">
      <header class="topbar"><div class="breadcrumb"><a href="#/discover">Arcade Atlas</a><span aria-hidden="true">/</span><strong>${escapeHTML(sectionName)}</strong></div><div class="top-actions"><button class="icon-button" data-action="search" aria-label="Search games">${icon("search-01")}</button><button class="icon-button" data-action="notifications" aria-label="Notifications">${icon("notification-03")}</button><span class="avatar top-avatar" aria-label="Alex Johnson">AJ</span></div></header>
      <div class="content">${content}</div>
    </main>
    <nav class="mobile-nav" aria-label="Mobile navigation"><a href="#/discover" class="${navKey === "discover" ? "active" : ""}"><span>${icon("home-01")}</span>Discover</a><a href="#/search" class="${navKey === "search" ? "active" : ""}"><span>${icon("search-01")}</span>Search</a><a href="#/create" class="${navKey === "create" ? "active" : ""}"><span>${icon("add-01")}</span>Create</a><a href="#/library" class="${navKey === "library" ? "active" : ""}"><span>${icon("bookmark-01")}</span>Library</a><a href="#/creator" class="${navKey === "creator" ? "active" : ""}"><span>${icon("user-circle")}</span>Profile</a></nav>
  </div>`;
}

function gameCard(game) {
  const isSaved = savedIds().includes(game.id);
  return `<article class="game-card"><button class="game-art-button" data-action="detail" data-id="${game.id}" aria-label="View ${escapeHTML(game.title)}">${art(game)}</button><div class="game-info"><div class="game-info-top"><div><h3 class="game-title"><a href="${game.url}" target="_blank" rel="noopener noreferrer">${escapeHTML(game.title)}</a></h3><p class="game-creator">by ${escapeHTML(game.creator)}</p></div><button class="save-mini ${isSaved ? "saved" : ""}" data-action="save" data-id="${game.id}" aria-label="${isSaved ? "Remove from" : "Save to"} library">${icon("heart")}</button></div><div class="game-stats"><span>${icon("arrow-up-01")} ${game.upvotes} upvotes</span><span>${icon("chat-01")} ${game.comments} comments</span></div></div></article>`;
}

function featuredGame() {
  const game = games[0];
  return `<section class="hero" aria-labelledby="featured-title"><div class="hero-copy"><span class="eyebrow">${icon("sparkles")} FEATURED ON FIFTH DOOR</span><h1 id="featured-title">${escapeHTML(game.title)}</h1><p class="hero-desc">${escapeHTML(game.description)}</p><div class="hero-meta"><strong>${escapeHTML(game.genre)}</strong><span>·</span><span>by ${escapeHTML(game.creator)}</span></div><div class="hero-actions"><a class="button" href="${game.url}" target="_blank" rel="noopener noreferrer">${icon("play")} Play on Fifth Door</a><button class="button ghost" data-action="detail" data-id="${game.id}">Explore game</button></div></div><div class="hero-visual" aria-hidden="true"><img src="${game.image}" alt="" loading="eager" decoding="async"/></div></section>`;
}

function gameGrid(list) { return `<div class="game-grid">${list.map(gameCard).join("")}</div>`; }

function discoverPage() {
  const hasHistory = playedIds().length > 0;
  const recent = playedIds().map(findGame).filter(Boolean).slice(0, 4);
  return `${featuredGame()}
    ${hasHistory ? `<section><div class="section-head"><div><h2>Pick up where you left off</h2><p>Your latest games are right here.</p></div><a class="text-link" href="#/library">View history ${icon("arrow-up-right-01")}</a></div>${gameGrid(recent)}</section>` : ""}
    <section><div class="section-head"><div><h2>Launched this week</h2><p>New games from Fifth Door creators.</p></div><a class="text-link" href="#/search">See all games ${icon("arrow-up-right-01")}</a></div>${gameGrid(games.slice(1, 5))}</section>
    <section><div class="section-head"><div><h2>Find your kind of fun</h2><p>A good game is whatever you feel like playing.</p></div></div><div class="genre-layout">${genres.slice(1).map((name) => { const sample = games.find((game) => game.genre === name); return `<button class="genre-tile" style="--genre-image:url('${sample.image}')" data-action="genre" data-genre="${name}"><strong>${escapeHTML(name)}</strong><small>${games.filter((game) => game.genre === name).length} games</small></button>`; }).join("")}</div></section>
    <section><div class="section-head"><div><h2>More launches</h2><p>Open the original game page on Fifth Door.</p></div><a class="text-link" href="#/search">Browse the catalog ${icon("arrow-up-right-01")}</a></div>${gameGrid(games.slice(5, 9))}</section>
    <section><div class="section-head"><div><h2>Creators to know</h2><p>Good ideas come from good people.</p></div><a class="text-link" href="#/creator">Meet the community ${icon("arrow-up-right-01")}</a></div><div class="creator-grid">${creators.map(creatorCard).join("")}</div></section>
    <section><div class="section-head"><div><h2>Featured games</h2><p>Quick links back to Fifth Door.</p></div><a class="text-link" href="#/jam">See more ${icon("arrow-up-right-01")}</a></div><div class="jam-grid">${jams.slice(0, 2).map(jamCard).join("")}</div></section>`;
}

function jamCard(jam) {
  return `<a class="jam-card ${jam.color}" href="${jam.url}" target="_blank" rel="noopener noreferrer"><img class="jam-cover" src="${jam.image}" alt="" loading="lazy" decoding="async"/><span class="jam-state">${jam.state}</span><span class="jam-icon">${icon(jam.icon)}</span><h3>${escapeHTML(jam.title)}</h3><div class="jam-meta"><span>${icon("arrow-up-01")} ${jam.entries} upvotes</span><span>${icon("arrow-up-right-01")} ${jam.days}</span></div></a>`;
}

function creatorCard(creator) {
  const game = games.find((item) => item.creator === creator.name);
  const following = readStore("arcade-atlas:followed", []).includes(creator.name);
  return `<article class="creator-card"><div class="creator-cover"><img src="${game.image}" alt="" loading="lazy" decoding="async"/><span class="avatar ${creator.tint}">${creator.initials}</span></div><div class="creator-card-info"><div class="creator-card-copy"><strong>${creator.name}</strong><small>${creator.handle} · ${creator.games} games</small><p>${creator.bio}</p></div><button class="button secondary small" data-action="follow" data-name="${escapeHTML(creator.name)}">${following ? "Following" : "Follow"}</button></div></article>`;
}

function searchPage() {
  let filtered = games.filter((game) => {
    const matchesQuery = `${game.title} ${game.creator} ${game.genre} ${game.description}`.toLowerCase().includes(state.query.toLowerCase());
    return matchesQuery && (state.filter === "All games" || game.genre === state.filter);
  });
  if (state.sort === "Most Upvoted") filtered = [...filtered].sort((a, b) => b.upvotes - a.upvotes);
  if (state.sort === "Most Discussed") filtered = [...filtered].sort((a, b) => b.comments - a.comments);
  if (state.sort === "Alphabetical") filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  const filterList = ["All games", ...genres.slice(1)];
  return `<span class="eyebrow">THE WHOLE ARCADE, AT YOUR PACE</span><h1 class="page-title">Find your next favorite.</h1><p class="page-subtitle">Search by title, creator, genre, or even the feeling you’re after.</p><div style="margin-top:21px" class="search-box">${icon("search-01")}<label class="sr-only" for="game-search">Search games, creators, and genres</label><input id="game-search" type="search" value="${escapeHTML(state.query)}" placeholder="Try ‘cozy’, ‘space’, or a creator name…" autocomplete="off"/><kbd>↵</kbd></div>
    <div class="toolbar"><div class="genre-strip" role="group" aria-label="Filter by genre">${filterList.map((genre) => `<button class="genre-chip ${state.filter === genre ? "active" : ""}" data-action="filter" data-genre="${genre}">${escapeHTML(genre)}</button>`).join("")}</div><label class="sr-only" for="sort-games">Sort games</label><select id="sort-games" class="select">${["Recommended", "Most Upvoted", "Most Discussed", "Alphabetical"].map((sort) => `<option ${state.sort === sort ? "selected" : ""}>${sort}</option>`).join("")}</select></div>
    <p class="result-count">${filtered.length} ${filtered.length === 1 ? "game" : "games"}${state.query ? ` for “${escapeHTML(state.query)}”` : " to explore"}</p>${filtered.length ? gameGrid(filtered) : `<div class="empty-state"><h3>No games found just yet.</h3><p>Try a different search or clear your filters to see the full arcade.</p><button class="button secondary" data-action="clear-filters">Clear filters</button></div>`}`;
}

function detailPage(id) {
  const game = findGame(id);
  if (!game) return `<div class="empty-state"><h3>That game wandered off.</h3><p>Browse the arcade and find something new to play.</p><a class="button" href="#/discover">Back to discover</a></div>`;
  const related = games.filter((item) => item.id !== game.id && item.genre === game.genre).slice(0, 3);
  return `<section class="detail-hero"><div class="detail-art">${art(game, "GAME PREVIEW")}<div class="detail-art-shade"></div><div class="detail-topline"><button class="detail-back" data-action="discover">${icon("arrow-left-01")} Back to discover</button><span class="detail-source">${icon("sparkles")} FEATURED ON FIFTH DOOR</span></div><div class="detail-copy"><span class="detail-genre">${escapeHTML(game.genre)}</span><h1>${escapeHTML(game.title)}</h1><p class="detail-creator">Made by <button class="text-link" data-action="creator">${escapeHTML(game.creator)}</button></p><p class="detail-description">${escapeHTML(game.description)}</p><div class="detail-actions"><a class="button" href="${game.url}" target="_blank" rel="noopener noreferrer">${icon("play")} Play on Fifth Door ${icon("arrow-up-right-01")}</a><button class="button secondary" data-action="save" data-id="${game.id}">${icon("bookmark-01")} ${savedIds().includes(game.id) ? "Saved" : "Save to library"}</button><button class="button secondary detail-share" data-action="share" data-id="${game.id}" aria-label="Share ${escapeHTML(game.title)}">${icon("share-01")}</button></div></div><div class="detail-image-count">${icon("image-01")} GAME COVER</div></div></section>
    <div class="detail-content"><section class="panel detail-about"><div class="detail-panel-heading"><span class="detail-panel-icon">${icon("game-controller-03")}</span><div><span class="eyebrow">THE STORY</span><h2>About this game</h2></div></div><p>${escapeHTML(game.description)}</p><div class="detail-tags"><span>${escapeHTML(game.genre)}</span><span>Browser game</span><span>Fifth Door</span></div></section><aside class="panel detail-creator-panel"><span class="eyebrow">MEET THE CREATOR</span><div class="detail-creator-row"><span class="detail-avatar">${escapeHTML(game.creator.slice(0, 1).toUpperCase())}</span><div><strong>${escapeHTML(game.creator)}</strong><small>Game creator</small></div></div><p>Discover the original game and more details from its creator.</p><a class="button secondary small" href="${game.url}" target="_blank" rel="noopener noreferrer">Visit creator’s game ${icon("arrow-up-right-01")}</a></aside></div>
    <div class="detail-meta-row"><div class="detail-stats"><span>${icon("arrow-up-01")} <strong>${game.upvotes}</strong> upvotes</span><span>${icon("chat-01")} <strong>${game.comments}</strong> comments</span><a href="${game.url}" target="_blank" rel="noopener noreferrer">Original page on Fifth Door ${icon("arrow-up-right-01")}</a></div><span class="detail-meta-note">Game details and play experience hosted by Fifth Door</span></div>
    ${related.length ? `<section><div class="section-head"><div><h2>More in ${game.genre}</h2><p>If this felt right, these might too.</p></div></div>${gameGrid(related)}</section>` : ""}`;
}

function playPage(id) {
  const game = findGame(id);
  if (!game) return detailPage(id);
  const player = state.player;
  const screen = !player.running ? `<div class="player-overlay"><div class="player-overlay-card"><span class="eyebrow">BROWSER DEMO</span><h2>Ready when you are.</h2><p>This lightweight sample arcade run works with your arrow keys. No sign-in or download needed.</p><button class="button" data-action="start-play">Start playing &nbsp; ${icon("arrow-right-01")}</button></div></div>` : player.paused ? `<div class="player-overlay"><div class="player-overlay-card"><span class="eyebrow">TAKE YOUR TIME</span><h2>Paused.</h2><p>Your run is right where you left it.</p><button class="button" data-action="resume-play">Back to the game</button></div></div>` : "";
  return `<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:16px"><div><span class="eyebrow">NOW PLAYING</span><h1 class="page-title" style="font-size:28px;margin:5px 0">${escapeHTML(game.title)}</h1></div><button class="button secondary small" data-action="back-detail" data-id="${game.id}">${icon("arrow-left-01")} Game details</button></div><section class="player-shell" aria-label="${escapeHTML(game.title)} browser demo"><div class="player-toolbar"><strong>${escapeHTML(game.title)} <span style="color:var(--muted);font-weight:400">· sample build</span></strong><div style="display:flex;gap:6px"><button class="icon-button" data-action="pause-play" aria-label="${player.paused ? "Resume" : "Pause"} game">${icon(player.paused ? "play" : "pause")}</button><button class="icon-button" data-action="restart-play" aria-label="Restart game">${icon("reload")}</button><button class="icon-button" data-action="fullscreen" aria-label="Enter fullscreen">${icon("full-screen")}</button></div></div><div class="player-stage"><div class="player-scene" id="player-scene"><span class="player-score">SCORE &nbsp; ${player.score.toString().padStart(4, "0")}</span><span class="player-track"></span><span class="player-ship" style="left:${player.x}%"></span><span class="player-hint">← → to steer · Space to pause</span></div>${screen}</div></section><p class="player-notice">Sample browser game for this prototype. Real game builds can plug into this player through a versioned game runtime.</p><div class="section-head"><div><h2>One more little world?</h2><p>Take a breather, then discover something else.</p></div><button class="text-link" data-action="discover">Browse the arcade ${icon("arrow-up-right-01")}</button></div>${gameGrid(games.filter((item) => item.id !== game.id).slice(0, 3))}`;
}

function createPage() {
  const active = state.generation;
  const savedDrafts = drafts();
  if (active?.complete) {
    return `<span class="eyebrow">YOUR IDEA, IN A PLAYABLE SHAPE</span><h1 class="page-title">The first version is ready.</h1><p class="page-subtitle">A clearly labeled sample generated for this demo. Your prompt stays editable, and each saved version remains in your draft history.</p><div class="demo-note"><span>${icon("information-circle")}</span><span><strong>Demo generation mode.</strong> No AI service is connected; this is a sample result to show how the creation workflow would feel.</span></div><div class="workspace-grid"><section><div class="draft-preview"><div class="preview-game" aria-label="Sample game preview"></div></div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px"><button class="button secondary" data-action="restart-preview">${icon("reload")} Restart preview</button><button class="button secondary" data-action="edit-prompt">${icon("edit-01")} Edit prompt</button><button class="button" data-action="save-draft">Save draft</button></div><div class="panel" style="margin-top:14px"><label class="field-label" for="iteration">What would you like to change?</label><div style="display:flex;gap:8px"><input id="iteration" class="text-field" placeholder="Make it a little more challenging…"/><button class="button secondary" data-action="iterate">Request change</button></div><div class="prompt-chips"><button class="prompt-chip" data-action="iteration-prompt" data-prompt="Add a new level">Add a new level</button><button class="prompt-chip" data-action="iteration-prompt" data-prompt="Change the visual theme">Change the visual theme</button><button class="prompt-chip" data-action="iteration-prompt" data-prompt="Improve the controls">Improve the controls</button></div></div></section><aside class="panel"><h3>Version history</h3><p style="margin-bottom:13px">Each change creates a new version. Nothing is overwritten.</p><div class="version-list">${(active.versions || ["v1 · First playable version"]).map((version, index) => `<div class="version-item"><strong>${escapeHTML(version)}</strong><small>${index === 0 ? "Just now · demo" : "Earlier · demo"}</small></div>`).join("")}</div><div class="demo-note"><span>${icon("information-circle")}</span><span>Publishing is shown as a prototype action. Connect a publishing service before sharing publicly.</span></div></aside></div>`;
  }
  return `<section class="create-banner"><span class="eyebrow">A LITTLE SPARK CAN GO A LONG WAY</span><h1>Your next great game starts with an idea.</h1><p>Tell us what you’ve been imagining. We’ll help you find the first playable shape for it — no game dev experience required.</p></section><form class="create-form" id="create-form"><label class="field-label" for="game-idea">What kind of game are you dreaming up?</label><textarea class="text-area" id="game-idea" name="idea" required minlength="8" placeholder="A colorful platform game where players hop across floating islands, collect stars, and discover a new path each time…"></textarea><div class="prompt-chips"><button type="button" class="prompt-chip" data-action="example-prompt" data-prompt="A cozy puzzle game about restoring a little moon garden, one constellation at a time.">A cozy puzzle game</button><button type="button" class="prompt-chip" data-action="example-prompt" data-prompt="A one-button arcade game where a tiny spaceship dodges asteroids and collects stardust.">A tiny arcade game</button><button type="button" class="prompt-chip" data-action="example-prompt" data-prompt="A gentle adventure about a lantern spirit exploring a forest after winter.">A gentle adventure</button></div><div class="form-row"><div><label class="field-label" for="game-title">Optional title</label><input id="game-title" name="title" class="text-field" placeholder="Something wonderful" maxlength="48"/></div><div><label class="field-label" for="game-genre">Starting genre</label><select id="game-genre" class="select" style="width:100%">${genres.slice(1).map((genre) => `<option>${genre}</option>`).join("")}</select></div></div><div style="display:flex;align-items:center;gap:12px;margin-top:18px"><button class="button" type="submit">${icon("sparkles")} Make a demo game</button><span style="color:var(--muted);font-size:9px">About 10 seconds · sample workflow</span></div><div class="demo-note"><span>${icon("information-circle")}</span><span>Demo mode is active. This workflow creates a labeled sample result; connect a real generation service before representing outputs as AI-generated games.</span></div></form>
  ${active?.generating ? `<section class="panel" style="max-width:770px;margin-top:15px"><span class="eyebrow">DEMO GENERATION</span><h3 style="margin-top:8px">Making room for your idea…</h3><div class="generation-list">${active.steps.map((step, index) => `<div class="generation-step ${index < active.step ? "done" : index === active.step ? "current" : ""}"><span class="step-dot">${index < active.step ? icon("checkmark-circle-02") : index + 1}</span>${step}</div>`).join("")}</div><div class="loading-bar"><span></span></div></section>` : ""}
  ${savedDrafts.length ? `<section><div class="section-head"><div><h2>Your recent drafts</h2><p>Saved in this browser for the demo.</p></div><a class="text-link" href="#/studio">Open Creator Studio ${icon("arrow-up-right-01")}</a></div><div class="panel">${savedDrafts.slice(0, 3).map((draft) => `<div class="creator-row"><span class="avatar avatar-lilac">${icon("sparkles")}</span><span class="creator-copy"><strong>${escapeHTML(draft.title)}</strong><small>Draft · ${escapeHTML(draft.genre)} · ${draft.versions?.length || 1} version${(draft.versions?.length || 1) === 1 ? "" : "s"}</small></span><button class="button secondary small" data-action="open-draft" data-id="${draft.id}">Open</button></div>`).join("")}</div></section>` : ""}`;
}

function libraryPage() {
  const saved = savedIds().map(findGame).filter(Boolean);
  const recent = playedIds().map(findGame).filter(Boolean);
  return `<span class="eyebrow">YOUR CORNER OF THE ARCADE</span><h1 class="page-title">Your library.</h1><p class="page-subtitle">Saved games and recent adventures, kept close. This demo library lives in this browser.</p><section><div class="section-head"><div><h2>Saved for later</h2><p>${saved.length} saved ${saved.length === 1 ? "game" : "games"}</p></div></div>${saved.length ? gameGrid(saved) : `<div class="empty-state"><h3>Nothing tucked away yet.</h3><p>Save a game you like and it’ll be waiting here.</p><a class="button" href="#/discover">Find a game</a></div>`}</section><section><div class="section-head"><div><h2>Recently played</h2><p>Your last few stops in the arcade.</p></div></div>${recent.length ? gameGrid(recent) : `<div class="empty-state"><h3>No adventures yet.</h3><p>Start with a quick game. No account or download needed.</p><a class="button" href="#/discover">Pick something fun</a></div>`}</section><div class="demo-note"><span>${icon("information-circle")}</span><span>Library changes are saved locally in your browser. Sign-in and cross-device sync are not connected.</span></div>`;
}

function studioPage() {
  const localDrafts = drafts();
  const rows = [
    { title: "Neon Drift", genre: "Arcade", status: "Published", plays: "24,812", updated: "Nov 22" },
    { title: "Pocket Garden", genre: "Casual", status: "Draft", plays: "—", updated: "Nov 24" },
    ...localDrafts.map((draft) => ({ title: draft.title, genre: draft.genre, status: "Draft", plays: "—", updated: "Nov 24", id: draft.id }))
  ];
  return `<div style="display:flex;align-items:end;justify-content:space-between;gap:14px"><div><span class="eyebrow">YOUR WORKSHOP</span><h1 class="page-title">Creator Studio.</h1><p class="page-subtitle">Everything you’ve made, in one tidy place. Sample analytics are labeled as demo data.</p></div><a class="button" href="#/create">${icon("add-01")} New game</a></div><div class="studio-stats"><div class="stat-card"><small>Published games</small><strong>1</strong><em>In this demo studio</em></div><div class="stat-card"><small>Drafts</small><strong>${1 + localDrafts.length}</strong><em>Including your saved drafts</em></div><div class="stat-card"><small>Total plays</small><strong>24.8k</strong><em>Sample analytics</em></div><div class="stat-card"><small>Players this week</small><strong>3.2k</strong><em>Sample analytics</em></div></div><section><div class="section-head"><div><h2>My games</h2><p>Manage what you’ve made and what’s still taking shape.</p></div><button class="text-link" data-action="analytics">View sample analytics ${icon("arrow-up-right-01")}</button></div><div class="table-wrap"><table><thead><tr><th>Game</th><th>Genre</th><th>Status</th><th>Plays</th><th>Updated</th><th>Actions</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${escapeHTML(row.title)}</td><td>${escapeHTML(row.genre)}</td><td><span class="status ${row.status === "Draft" ? "draft" : ""}">${row.status}</span></td><td>${row.plays}</td><td>${row.updated}</td><td><div class="table-actions"><button class="table-action" data-action="edit-game" data-id="${row.id || ""}">Edit</button><button class="table-action" data-action="preview-game" data-id="${row.id || "neon-drift"}">Preview</button>${row.status === "Draft" ? `<button class="table-action" data-action="publish-game" data-title="${escapeHTML(row.title)}">Publish</button>` : ""}</div></td></tr>`).join("")}</tbody></table></div></section><section class="panel" style="margin-top:16px"><div style="display:flex;align-items:center;justify-content:space-between"><div><h3 style="margin:0">Plays over the last week</h3><p style="margin-top:5px">Sample analytics · not connected to real player activity</p></div><span class="eyebrow">DEMO DATA</span></div><div style="display:flex;align-items:end;gap:12px;height:125px;margin-top:20px;padding:0 9px;border-bottom:1px solid var(--border)">${[45,68,54,82,61,95,74].map((height, index) => `<div style="flex:1;height:${height}%;border-radius:5px 5px 0 0;background:linear-gradient(0deg,#607c44,#a6f36a);opacity:${.52 + index * .055}" aria-label="${height} percent sample activity"></div>`).join("")}</div><div style="display:flex;justify-content:space-between;margin-top:7px;color:var(--subtle);font-size:9px"><span>Nov 18</span><span>Nov 24</span></div></section><div class="demo-note"><span>${icon("information-circle")}</span><span>Editing and publishing here are prototype interactions. No public game is actually published.</span></div>`;
}

function communityPage() {
  return `<span class="eyebrow">FIFTH DOOR CATALOG</span><h1 class="page-title">More games to explore.</h1><p class="page-subtitle">Browse the games, covers, and original play pages from Fifth Door.</p><section><div class="section-head"><div><h2>Launched this week</h2><p>Each card links to its original game.</p></div></div>${gameGrid(games.slice(1))}</section>`;
}

function creatorPage() {
  const creator = creators[2];
  return `<div class="profile-banner"><span class="profile-avatar">${creator.initials}</span><div style="flex:1"><span class="eyebrow">CREATOR PROFILE · DEMO</span><h1>${creator.name}</h1><p>${creator.bio}</p><small>5 games &nbsp; · &nbsp; 1.8k followers</small></div><button class="button secondary" data-action="follow" data-name="${creator.name}">Follow creator</button></div><section><div class="section-head"><div><h2>Games by ${creator.name}</h2><p>Small puzzles with room to wonder.</p></div></div>${gameGrid(games.filter((game) => game.creator === creator.name || game.genre === "Puzzle").slice(0, 4))}</section><div class="demo-note"><span>${icon("information-circle")}</span><span>This is a sample creator profile. Following is a local demo interaction.</span></div>`;
}

function render() {
  state.route = currentRoute();
  if (state.route.startsWith("play/") && state.route !== lastRenderedRoute) state.player = { running: false, paused: false, score: 0, x: 50 };
  lastRenderedRoute = state.route;
  const [page, id] = state.route.split("/");
  let content;
  if (page === "discover") content = discoverPage();
  else if (page === "search") content = searchPage();
  else if (page === "detail") content = detailPage(id);
  else if (page === "play") content = playPage(id);
  else if (page === "create") content = createPage();
  else if (page === "library") content = libraryPage();
  else if (page === "studio") content = studioPage();
  else if (page === "jam") content = communityPage();
  else if (page === "creator") content = creatorPage();
  else content = discoverPage();
  app.innerHTML = shell(content);
  if (page === "search") {
    const input = document.querySelector("#game-search");
    input?.focus({ preventScroll: true });
    input?.setSelectionRange(input.value.length, input.value.length);
  }
}

function toggleSave(id) {
  const saved = savedIds();
  if (saved.includes(id)) {
    writeStore("arcade-atlas:saved", saved.filter((savedId) => savedId !== id));
    toast("Removed from your library.");
  } else {
    writeStore("arcade-atlas:saved", [...saved, id]);
    toast("Saved to your library.");
  }
  render();
}

function startGeneration(idea, title, genre) {
  const steps = ["Understanding the game idea", "Planning game mechanics", "Building a sample game", "Preparing sample visuals", "Checking the demo experience", "Preparing a playable preview"];
  state.generation = { generating: true, complete: false, idea, title: title || "A Little Game", genre, steps, step: 0, versions: [] };
  render();
  const advance = () => {
    if (!state.generation?.generating) return;
    state.generation.step += 1;
    if (state.generation.step >= steps.length) {
      state.generation.generating = false;
      state.generation.complete = true;
      state.generation.versions = ["v1 · First playable sample"];
    }
    render();
    if (state.generation.generating) state.generationTimer = window.setTimeout(advance, 700);
  };
  state.generationTimer = window.setTimeout(advance, 500);
}

function saveDraft() {
  const current = state.generation;
  if (!current?.complete) return;
  const items = drafts();
  const existing = items.find((draft) => draft.title === current.title);
  const nextVersion = `v${(existing?.versions?.length || 0) + 1} · ${current.versions.at(-1)?.replace(/^v\d+ · /, "") || "First playable sample"}`;
  const draft = { id: existing?.id || crypto.randomUUID(), title: current.title, idea: current.idea, genre: current.genre, versions: [...(existing?.versions || []), nextVersion], updatedAt: new Date().toISOString() };
  writeStore("arcade-atlas:drafts", [draft, ...items.filter((item) => item.id !== draft.id)]);
  toast("Draft saved. Your earlier versions are still there.");
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, id, genre, name, prompt } = button.dataset;
  if (action === "detail") setRoute(`detail/${id}`);
  if (action === "play") { state.player = { running: false, paused: false, score: 0, x: 50 }; writeStore("arcade-atlas:played", [id, ...playedIds().filter((playedId) => playedId !== id)].slice(0, 6)); setRoute(`play/${id}`); }
  if (action === "save") toggleSave(id);
  if (action === "search") setRoute("search");
  if (action === "discover") setRoute("discover");
  if (action === "genre") { state.filter = genre; state.query = ""; setRoute("search"); }
  if (action === "filter") { state.filter = genre; render(); }
  if (action === "clear-filters") { state.filter = "All games"; state.query = ""; state.sort = "Recommended"; render(); }
  if (action === "share") {
    try { await navigator.clipboard.writeText(`${location.origin}${location.pathname}#/detail/${id}`); toast("Game link copied."); }
    catch { toast("Share link: " + `${location.pathname}#/detail/${id}`); }
  }
  if (action === "follow") { const followed = readStore("arcade-atlas:followed", []); const isFollowing = followed.includes(name); writeStore("arcade-atlas:followed", isFollowing ? followed.filter((item) => item !== name) : [...followed, name]); button.textContent = isFollowing ? "Follow" : "Following"; toast(isFollowing ? `Unfollowed ${name}.` : `You’re following ${name}.`); }
  if (action === "creator" || action === "profile") setRoute("creator");
  if (action === "notifications") toast("You’re all caught up.");
  if (action === "start-play" || action === "resume-play") { state.player.running = true; state.player.paused = false; render(); }
  if (action === "pause-play") { state.player.paused = !state.player.paused; render(); }
  if (action === "restart-play") { state.player = { running: true, paused: false, score: 0, x: 50 }; render(); toast("Fresh run. Good luck!"); }
  if (action === "back-detail") setRoute(`detail/${id}`);
  if (action === "fullscreen") { const target = document.querySelector(".player-shell"); if (!document.fullscreenElement) target?.requestFullscreen?.(); else document.exitFullscreen?.(); }
  if (action === "example-prompt") { const textarea = document.querySelector("#game-idea"); textarea.value = prompt; textarea.focus(); }
  if (action === "iteration-prompt") { const input = document.querySelector("#iteration"); input.value = prompt; input.focus(); }
  if (action === "edit-prompt") { state.generation.complete = false; render(); document.querySelector("#game-idea")?.focus(); }
  if (action === "restart-preview") toast("Sample preview restarted.");
  if (action === "save-draft") { saveDraft(); render(); }
  if (action === "iterate") {
    const input = document.querySelector("#iteration");
    if (!input.value.trim()) { toast("Describe a change first."); input.focus(); return; }
    state.generation.versions.push(`v${state.generation.versions.length + 1} · ${input.value.trim()}`);
    toast("A new sample version was added. Previous versions remain saved.");
    render();
  }
  if (action === "open-draft") {
    const draft = drafts().find((item) => item.id === id);
    if (draft) { state.generation = { complete: true, generating: false, idea: draft.idea, title: draft.title, genre: draft.genre, versions: draft.versions }; render(); }
  }
  if (action === "analytics") toast("Sample analytics are displayed below the games table.");
  if (action === "edit-game") { if (id) { const draft = drafts().find((item) => item.id === id); if (draft) { state.generation = { complete: true, generating: false, idea: draft.idea, title: draft.title, genre: draft.genre, versions: draft.versions }; setRoute("create"); } else toast("This sample game is read-only in the prototype."); } else toast("This sample game is read-only in the prototype."); }
  if (action === "preview-game") setRoute(`play/${id || "neon-drift"}`);
  if (action === "publish-game") {
    if (window.confirm(`Publish “${button.dataset.title}” as a demo listing? This will not make the game public.`)) toast("Demo publish preview complete. No public listing was created.");
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "game-search") {
    state.query = event.target.value;
    const cursor = event.target.selectionStart;
    render();
    const input = document.querySelector("#game-search");
    input?.setSelectionRange(cursor, cursor);
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "sort-games") { state.sort = event.target.value; render(); }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "create-form") return;
  event.preventDefault();
  const formData = new FormData(event.target);
  const idea = String(formData.get("idea") || "").trim();
  if (idea.length < 8) { toast("Add a little more detail to your idea."); return; }
  startGeneration(idea, String(formData.get("title") || "").trim(), document.querySelector("#game-genre").value);
});

document.addEventListener("keydown", (event) => {
  if (state.route.startsWith("play/") && state.player.running && !state.player.paused) {
    if (event.key === "ArrowLeft") { event.preventDefault(); state.player.x = Math.max(8, state.player.x - 6); }
    if (event.key === "ArrowRight") { event.preventDefault(); state.player.x = Math.min(92, state.player.x + 6); }
    if (event.key === " ") { event.preventDefault(); state.player.paused = true; render(); }
    if (event.key.startsWith("Arrow")) {
      state.player.score += 10;
      document.querySelector(".player-ship")?.style.setProperty("left", `${state.player.x}%`);
      const score = document.querySelector(".player-score");
      if (score) score.textContent = `SCORE   ${state.player.score.toString().padStart(4, "0")}`;
    }
  }
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) { event.preventDefault(); setRoute("search"); }
  if (event.key === "Escape" && document.fullscreenElement) document.exitFullscreen?.();
});

window.addEventListener("hashchange", render);
render();

