import sharp from 'sharp'

const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" rx="80" fill="#00C896"/>
  <text x="256" y="340" font-family="Arial" font-weight="bold" font-size="280" fill="black" text-anchor="middle">T</text>
</svg>`)

await sharp(svg).resize(192, 192).toFile('public/icons/icon-192.png')
console.log('icon-192.png created ✓')

await sharp(svg).resize(512, 512).toFile('public/icons/icon-512.png')
console.log('icon-512.png created ✓')