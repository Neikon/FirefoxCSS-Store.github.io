import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const themesDir = path.join(root, 'src/content/themes')
const githubToken = process.env.GITHUB_TOKEN
const gitlabToken = process.env.GITLAB_TOKEN
const codebergToken = process.env.CODEBERG_TOKEN

async function requestJson(url, headers = {}) {
  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  return response.json()
}

function parseRepo(repository) {
  const url = new URL(repository)
  const [owner, name] = url.pathname.replace(/^\/|\/$/g, '').split('/')

  if (!owner || !name) {
    throw new Error(`Unsupported repository path: ${repository}`)
  }

  return { host: url.hostname.replace(/^www\./, ''), owner, name }
}

async function readGithub({ owner, name }) {
  const headers = githubToken ? { Authorization: `Bearer ${githubToken}` } : {}
  const data = await requestJson(`https://api.github.com/repos/${owner}/${name}`, headers)

  return {
    stars: data.stargazers_count ?? 0,
    updatedAt: data.pushed_at ?? data.updated_at ?? null,
    ownerAvatar: data.owner?.avatar_url ?? null,
    accessible: true
  }
}

async function readGitlab({ owner, name }) {
  const headers = gitlabToken ? { Authorization: `Bearer ${gitlabToken}` } : {}
  const encoded = encodeURIComponent(`${owner}/${name}`)
  const data = await requestJson(`https://gitlab.com/api/v4/projects/${encoded}`, headers)

  const avatar = data.namespace?.avatar_url ?? null

  return {
    stars: data.star_count ?? 0,
    updatedAt: data.last_activity_at ?? null,
    ownerAvatar: avatar?.startsWith('/') ? `https://gitlab.com${avatar}` : avatar,
    accessible: true
  }
}

async function readCodeberg({ owner, name }) {
  const headers = codebergToken ? { Authorization: `token ${codebergToken}` } : {}
  const data = await requestJson(`https://codeberg.org/api/v1/repos/${owner}/${name}`, headers)

  return {
    stars: data.stars_count ?? 0,
    updatedAt: data.updated_at ?? null,
    ownerAvatar: data.owner?.avatar_url ?? null,
    accessible: true
  }
}

async function refreshTheme(file) {
  const filePath = path.join(themesDir, file)
  const theme = JSON.parse(await fs.readFile(filePath, 'utf8'))
  const repo = parseRepo(theme.repository)

  let stats
  if (repo.host === 'github.com') {
    stats = await readGithub(repo)
  } else if (repo.host === 'gitlab.com') {
    stats = await readGitlab(repo)
  } else if (repo.host === 'codeberg.org') {
    stats = await readCodeberg(repo)
  } else {
    stats = { ...theme.stats, accessible: true }
  }

  theme.stats = { ...theme.stats, ...stats }
  await fs.writeFile(filePath, `${JSON.stringify(theme, null, 2)}\n`)
  console.log(`Refreshed ${theme.slug}`)
}

const files = (await fs.readdir(themesDir)).filter((file) => file.endsWith('.json')).sort()

for (const file of files) {
  try {
    await refreshTheme(file)
  } catch (error) {
    const filePath = path.join(themesDir, file)
    const theme = JSON.parse(await fs.readFile(filePath, 'utf8'))
    theme.stats = { ...theme.stats, accessible: false }
    await fs.writeFile(filePath, `${JSON.stringify(theme, null, 2)}\n`)
    console.warn(`Could not refresh ${file}: ${error.message}`)
  }
}
