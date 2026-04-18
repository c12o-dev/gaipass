import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'

const root = resolve(import.meta.dirname, '..')
const src = resolve(root, 'public/icon.svg')

const targets = [
  { size: 192, out: 'public/pwa-192x192.png' },
  { size: 512, out: 'public/pwa-512x512.png' },
]

const svg = await readFile(src)

for (const { size, out } of targets) {
  const png = await sharp(svg, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer()
  await writeFile(resolve(root, out), png)
  console.log(`wrote ${out} (${png.length} bytes)`)
}
