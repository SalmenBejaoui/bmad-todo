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
 * Uses Node's built-in test runner (node:test) — no extra dependencies needed.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

function rootPath(...segments) {
  return join(ROOT, ...segments);
}

function readJson(relPath) {
  return JSON.parse(readFileSync(rootPath(relPath), 'utf8'));
}

function readText(relPath) {
  return readFileSync(rootPath(relPath), 'utf8');
}

// ─── Root package.json ────────────────────────────────────────────────────────

describe('Root package.json', () => {
  const pkg = readJson('package.json');

  it('has name "bmad-todo"', () => {
    assert.equal(pkg.name, 'bmad-todo');
  });

  it('is private', () => {
    assert.equal(pkg.private, true);
  });

  it('declares workspaces ["frontend", "backend"]', () => {
    assert.deepEqual(pkg.workspaces, ['frontend', 'backend']);
  });

  it('has "dev" script using concurrently', () => {
    assert.ok(pkg.scripts.dev, '"dev" script must exist');
    assert.match(pkg.scripts.dev, /concurrently/, '"dev" script must use concurrently');
    assert.match(pkg.scripts.dev, /frontend/, '"dev" script must reference frontend workspace');
    assert.match(pkg.scripts.dev, /backend/, '"dev" script must reference backend workspace');
  });

  it('has "test" script delegating to backend workspace', () => {
    assert.ok(pkg.scripts.test, '"test" script must exist');
    assert.match(pkg.scripts.test, /backend/, '"test" script must reference backend workspace');
  });

  it('has "test:e2e" script referencing Playwright and e2e/', () => {
    assert.ok(pkg.scripts['test:e2e'], '"test:e2e" script must exist');
    assert.match(pkg.scripts['test:e2e'], /playwright/, '"test:e2e" must invoke playwright');
    assert.match(pkg.scripts['test:e2e'], /e2e\//, '"test:e2e" must reference e2e/ directory');
  });

  it('has "build" script delegating to both workspaces', () => {
    assert.ok(pkg.scripts.build, '"build" script must exist');
    assert.match(pkg.scripts.build, /frontend/, '"build" script must reference frontend');
    assert.match(pkg.scripts.build, /backend/, '"build" script must reference backend');
  });

  it('declares concurrently ^9.0.0 in devDependencies', () => {
    assert.ok(pkg.devDependencies?.concurrently, 'concurrently must be in devDependencies');
    assert.match(pkg.devDependencies.concurrently, /\^9/, 'concurrently must be ^9.x');
  });

  it('enforces Node >=24.0.0 via engines field', () => {
    assert.ok(pkg.engines?.node, 'engines.node must be set');
    assert.match(pkg.engines.node, /24/, 'engines.node must reference Node 24');
  });
});

// ─── Sub-package workspace names ─────────────────────────────────────────────

describe('Workspace sub-packages', () => {
  it('frontend/package.json has name "frontend"', () => {
    const pkg = readJson('frontend/package.json');
    assert.equal(pkg.name, 'frontend');
  });

  it('backend/package.json has name "backend"', () => {
    const pkg = readJson('backend/package.json');
    assert.equal(pkg.name, 'backend');
  });
});

// ─── .env.example ────────────────────────────────────────────────────────────

describe('.env.example', () => {
  const envContent = readText('.env.example');

  const requiredVars = [
    'VITE_API_URL',
    'PORT',
    'ALLOWED_ORIGIN',
    'DATABASE_URL',
  ];

  for (const varName of requiredVars) {
    it(`contains ${varName}`, () => {
      assert.ok(
        envContent.includes(varName),
        `.env.example must contain ${varName}`
      );
    });
  }

  it('contains placeholder values (no empty assignments)', () => {
    const lines = envContent
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#'));

    for (const line of lines) {
      const parts = line.split('=');
      assert.ok(
        parts.length >= 2 && parts[1] !== undefined && parts[1].trim().length > 0,
        `${line} must have a placeholder value`
      );
    }
  });
});

// ─── .gitignore ───────────────────────────────────────────────────────────────

describe('.gitignore', () => {
  const content = readText('.gitignore');

  const requiredEntries = [
    '.env',
    'node_modules',
    'dist',
    'frontend/dist/',
    'backend/dist/',
    'backend/node_modules/.prisma/',
    'backend/src/generated/',
  ];

  for (const entry of requiredEntries) {
    it(`contains "${entry}"`, () => {
      assert.ok(
        content.includes(entry),
        `.gitignore must contain "${entry}"`
      );
    });
  }
});

// ─── .nvmrc ───────────────────────────────────────────────────────────────────

describe('.nvmrc', () => {
  it('exists at project root', () => {
    assert.ok(existsSync(rootPath('.nvmrc')), '.nvmrc must exist');
  });

  it('specifies Node 24', () => {
    const content = readText('.nvmrc').trim();
    assert.match(content, /^24/, '.nvmrc first line must start with 24');
  });
});

// ─── e2e/ directory ──────────────────────────────────────────────────────────

describe('e2e/ directory', () => {
  it('exists at project root', () => {
    assert.ok(existsSync(rootPath('e2e')), 'e2e/ directory must exist');
  });
});
