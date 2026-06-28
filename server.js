require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const CONFIG_PATH = path.join(ROOT, 'config.json');

let config = loadConfig();
let avatarCache = { url: null, fetchedAt: 0 };
const AVATAR_TTL = 1000 * 60 * 30;

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function reloadConfig() {
  config = loadConfig();
  avatarCache = { url: null, fetchedAt: 0 };
}

function defaultAvatarUrl(userId) {
  const index = Number((BigInt(userId) >> 22n) % 6n);
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

function buildAvatarUrl(userId, avatarHash) {
  if (!avatarHash) return defaultAvatarUrl(userId);
  const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=256`;
}

async function fetchDiscordAvatar(userId) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return defaultAvatarUrl(userId);
  }

  const res = await fetch(`https://discord.com/api/v10/users/${userId}`, {
    headers: { Authorization: `Bot ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Discord API error: ${res.status}`);
  }

  const user = await res.json();
  return buildAvatarUrl(userId, user.avatar);
}

async function getAvatarUrl() {
  const userId = config.discord?.userId;
  if (!userId || userId === 'YOUR_DISCORD_USER_ID') {
    return null;
  }

  const now = Date.now();
  if (avatarCache.url && now - avatarCache.fetchedAt < AVATAR_TTL) {
    return avatarCache.url;
  }

  try {
    const url = await fetchDiscordAvatar(userId);
    avatarCache = { url, fetchedAt: now };
    return url;
  } catch (err) {
    console.error('Failed to fetch Discord avatar:', err.message);
    return avatarCache.url || defaultAvatarUrl(userId);
  }
}

function publicConfig(avatarUrl) {
  return { ...config, avatarUrl };
}

app.get('/api/config', async (_req, res) => {
  try {
    const avatarUrl = await getAvatarUrl();
    res.json(publicConfig(avatarUrl));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/avatar', async (_req, res) => {
  try {
    const avatarUrl = await getAvatarUrl();
    if (!avatarUrl) {
      return res.status(404).json({ error: 'Avatar not configured' });
    }
    res.redirect(avatarUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reload', (_req, res) => {
  reloadConfig();
  res.json({ ok: true });
});

app.use(express.static(ROOT));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
