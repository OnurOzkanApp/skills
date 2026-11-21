#!/usr/bin/env node
// Uploads images to a `pr-media` branch of the GitHub remote and prints a
// Markdown image for each, ready to paste into a PR. It builds the commit in a
// temporary index, so the checkout, its index and the current branch are never
// touched. It never force-pushes: a push that loses a race is rebuilt once on
// the new tip.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, extname, join } from 'node:path'

const USAGE = 'Usage: node pr-media.mjs --folder <name> [--remote origin] [--branch pr-media] <image>...'

function parse(argv) {
  const options = { folder: '', remote: 'origin', branch: 'pr-media', files: [] }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') return null
    if (arg === '--folder' || arg === '--remote' || arg === '--branch') {
      const value = argv[++i]
      if (!value) throw new Error(`${arg} needs a value.\n${USAGE}`)
      options[arg.slice(2)] = value
    } else {
      options.files.push(arg)
    }
  }
  options.folder = options.folder.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
  if (!options.folder) throw new Error(`--folder is required.\n${USAGE}`)
  if (!options.files.length) throw new Error(`Name at least one image.\n${USAGE}`)
  for (const file of options.files) {
    if (!statSync(file, { throwIfNoEntry: false })?.isFile()) throw new Error(`Not a file: ${file}`)
  }
  return options
}

function git(args, env) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env }).trim()
}

function repoSlug(remote) {
  const url = git(['remote', 'get-url', remote])
  const match = url.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?\/?$/)
  if (!match) throw new Error(`The ${remote} remote is not on GitHub: ${url}`)
  return `${match[1]}/${match[2]}`
}

function remoteTip(remote, branch) {
  const tracking = `refs/remotes/${remote}/${branch}`
  try {
    git(['fetch', '--quiet', remote, `+refs/heads/${branch}:${tracking}`])
  } catch {
    return null
  }
  return git(['rev-parse', '--verify', '--quiet', tracking]) || null
}

function upload({ folder, remote, branch, files }) {
  const dir = mkdtempSync(join(tmpdir(), 'pr-media-'))
  const env = { ...process.env, GIT_INDEX_FILE: join(dir, 'index') }
  try {
    for (let attempt = 1; ; attempt++) {
      const parent = remoteTip(remote, branch)
      git(parent ? ['read-tree', parent] : ['read-tree', '--empty'], env)
      for (const file of files) {
        const blob = git(['hash-object', '-w', '--no-filters', file])
        git(['update-index', '--add', '--cacheinfo', `100644,${blob},${folder}/${basename(file)}`], env)
      }
      const tree = git(['write-tree'], env)
      const commit = git(['commit-tree', tree, ...(parent ? ['-p', parent] : []), '-m', `media: ${folder}`])
      try {
        git(['push', '--quiet', remote, `${commit}:refs/heads/${branch}`])
        return
      } catch (error) {
        if (attempt >= 2) throw error
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

try {
  const options = parse(process.argv.slice(2))
  if (!options) {
    console.log(USAGE)
    process.exit(0)
  }
  const slug = repoSlug(options.remote)
  upload(options)
  for (const file of options.files) {
    const name = basename(file)
    const path = [options.branch, options.folder, name].map(encodeURIComponent).join('/')
    console.log(`![${basename(name, extname(name))}](https://github.com/${slug}/blob/${path}?raw=true)`)
  }
} catch (error) {
  console.error(String(error.stderr || error.message || error).trim())
  process.exit(1)
}
