/**
 * Story 1.1: Monorepo Root Workspace Setup — Integrity Tests
 *
 * Verifies that the repository scaffold produced by Story 1.1 is correct:
 * - Root package.json shape (workspaces, scripts, engines, devDependencies)
 * - Sub-package names match workspace declarations
 * - .env.example contains all required environment variables
 * - .gitignore contains all required entries
 * - .nvmrc declares Node 24
 * - e2e/ directory exists
 *
 * Originally used node:test (Story 1.1 had zero deps). Converted to Vitest
 * in Story 1.2 to unify the backend test runner per architecture spec.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolve(__dirname, '..', '..')

function rootPath(...segments: string[]): string {
  return join(ROOT, ...segments)
}

function readJson(relPath: string): Record<string, any> {
  return JSON.parse(readFileSync(rootPath(relPath), 'utf8'))
}

function readText(relPath: string): string {
  return readFileSync(rootPath(relPath), 'utf8')
}

// ─── Root package.json ────────────────────────────────────────────────────────

describe('Root package.json', () => {
  const pkg = readJson('package.json')

  it('has name "bmad-todo"', () => {
    expect(pkg.name).toBe('bmad-todo')
  })

  it('is private', () => {
    expect(pkg.private).toBe(true)
  })

  it('declares workspaces ["frontend", "backend", "e2e"]', () => {
    expect(pkg.workspaces).toEqual(['frontend', 'backend', 'e2e'])
  })

  it('has "dev" script using concurrently', () => {
    expect(pkg.scripts.dev).toBeTruthy()
    expect(pkg.scripts.dev).toMatch(/concurrently/)
    expect(pkg.scripts.dev).toMatch(/frontend/)
    expect(pkg.scripts.dev).toMatch(/backend/)
  })

  it('has "test" script delegating to backend workspace', () => {
    expect(pkg.scripts.test).toBeTruthy()
    expect(pkg.scripts.test).toMatch(/backend/)
  })

  it('has "test:e2e" script referencing Playwright and e2e/', () => {
    expect(pkg.scripts['test:e2e']).toBeTruthy()
    expect(pkg.scripts['test:e2e']).toMatch(/playwright/)
    expect(pkg.scripts['test:e2e']).toMatch(/e2e\//)
  })

  it('has "build" script delegating to both workspaces', () => {
    expect(pkg.scripts.build).toBeTruthy()
    expect(pkg.scripts.build).toMatch(/frontend/)
    expect(pkg.scripts.build).toMatch(/backend/)
  })

  it('declares concurrently ^9.0.0 in devDependencies', () => {
    expect(pkg.devDependencies?.concurrently).toBeTruthy()
    expect(pkg.devDependencies.concurrently).toMatch(/\^9/)
  })

  it('enforces Node >=24.0.0 via engines field', () => {
    expect(pkg.engines?.node).toBeTruthy()
    expect(pkg.engines.node).toMatch(/24/)
  })
})

// ─── Sub-package workspace names ─────────────────────────────────────────────

describe('Workspace sub-packages', () => {
  it('frontend/package.json has name "frontend"', () => {
    const pkg = readJson('frontend/package.json')
    expect(pkg.name).toBe('frontend')
  })

  it('backend/package.json has name "backend"', () => {
    const pkg = readJson('backend/package.json')
    expect(pkg.name).toBe('backend')
  })
})

// ─── .env.example ────────────────────────────────────────────────────────────

describe('.env.example', () => {
  const envContent = readText('.env.example')

  const requiredVars = [
    'VITE_API_URL',
    'PORT',
    'ALLOWED_ORIGIN',
    'DATABASE_URL',
  ]

  for (const varName of requiredVars) {
    it(`contains ${varName}`, () => {
      expect(envContent).toContain(varName)
    })
  }

  it('contains placeholder values (no empty assignments)', () => {
    const lines = envContent
      .split('\n')
      .filter((line: string) => line.trim() && !line.startsWith('#'))

    for (const line of lines) {
      const parts = line.split('=')
      expect(
        parts.length >= 2 && parts[1] !== undefined && parts[1].trim().length > 0,
      ).toBe(true)
    }
  })
})

// ─── .gitignore ───────────────────────────────────────────────────────────────

describe('.gitignore', () => {
  const content = readText('.gitignore')

  const requiredEntries = [
    '.env',
    'node_modules',
    'dist',
    'frontend/dist/',
    'backend/dist/',
    'backend/node_modules/.prisma/',
    'backend/src/generated/',
  ]

  for (const entry of requiredEntries) {
    it(`contains "${entry}"`, () => {
      expect(content).toContain(entry)
    })
  }
})

// ─── .nvmrc ───────────────────────────────────────────────────────────────────

describe('.nvmrc', () => {
  it('exists at project root', () => {
    expect(existsSync(rootPath('.nvmrc'))).toBe(true)
  })

  it('specifies Node 24', () => {
    const content = readText('.nvmrc').trim()
    expect(content).toMatch(/^24/)
  })
})

// ─── e2e/ directory ──────────────────────────────────────────────────────────

describe('e2e/ directory', () => {
  it('exists at project root', () => {
    expect(existsSync(rootPath('e2e'))).toBe(true)
  })
})
