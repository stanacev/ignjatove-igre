/**
 * Priprema sliku pre uploada: odseca jednobojne ivice (bela pozadina ili prozirnost
 * oko kutije), smanjuje je (najduža strana `maxSide` px) i pravi WebP,
 * ili JPEG ako browser ne ume WebP. Tako 50+ igara staje u besplatan Storage.
 */
export async function resizeImage(file: Blob, maxSide = 1000): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const crop = trimBounds(bitmap);
  const scale = Math.min(1, maxSide / Math.max(crop.w, crop.h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(crop.w * scale);
  canvas.height = Math.round(crop.h * scale);
  canvas
    .getContext('2d')!
    .drawImage(bitmap, crop.x, crop.y, crop.w, crop.h, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  const webp = await encode('image/webp');
  if (webp?.type === 'image/webp') return webp;
  const jpeg = await encode('image/jpeg');
  if (!jpeg) throw new Error('Slika ne može da se obradi.');
  return jpeg;
}

/**
 * Pravougaonik bez jednobojnih ivica. Boja pozadine je boja gornjeg levog ugla;
 * piksel pripada pozadini ako je skoro prozirn ili skoro iste boje.
 */
function trimBounds(bitmap: ImageBitmap): { x: number; y: number; w: number; h: number } {
  const full = { x: 0, y: 0, w: bitmap.width, h: bitmap.height };
  // analiza na manjoj kopiji – dovoljno precizno, a brzo
  const s = Math.min(1, 400 / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * s));
  const h = Math.max(1, Math.round(bitmap.height * s));
  const ctx = Object.assign(document.createElement('canvas'), { width: w, height: h }).getContext('2d', {
    willReadFrequently: true,
  });
  if (!ctx) return full;
  ctx.drawImage(bitmap, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;

  const [br, bg, bb, ba] = [px[0], px[1], px[2], px[3]];
  const isBackground = (i: number) =>
    px[i + 3] < 24 ||
    (ba > 200 && Math.abs(px[i] - br) < 22 && Math.abs(px[i + 1] - bg) < 22 && Math.abs(px[i + 2] - bb) < 22);

  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isBackground((y * w + x) * 4)) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return full; // cela slika je jedna boja

  // mali vazduh oko kutije, pa nazad u pune piksele
  const m = Math.round(Math.max(maxX - minX, maxY - minY) * 0.02);
  const x0 = Math.max(0, minX - m) / s;
  const y0 = Math.max(0, minY - m) / s;
  const x1 = Math.min(w, maxX + 1 + m) / s;
  const y1 = Math.min(h, maxY + 1 + m) / s;
  const crop = { x: Math.floor(x0), y: Math.floor(y0), w: Math.ceil(x1 - x0), h: Math.ceil(y1 - y0) };
  // ako se skoro ništa ne odseca, ostavi original
  return crop.w * crop.h > full.w * full.h * 0.97 ? full : crop;
}

/** ID videa iz bilo kog YouTube linka (watch, youtu.be, shorts, embed). */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}
