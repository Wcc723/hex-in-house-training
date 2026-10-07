"""Codex 原圖 → 專案貼紙素材（WebP）。

    python3 sticker.py <codex 原圖.png> <輸出.webp>              # 方形素材，512×512
    python3 sticker.py <codex 原圖.png> <輸出.webp> --wide 1024  # 橫圖（例如吉祥物），保留比例、寬 1024

原圖要畫在純綠 #00FF00 上（prompt 寫法見 references/images.md 的「貼紙素材」）。
傳 Codex 的**原始檔**（~/.codex/generated_images/<session>/exec-*.png，codex-image.sh 的
log 會印出「原始檔：」那一行），不要傳 `codex-image.sh -k` 去背過的結果：

  它的 soft matte 只看顏色距離，薄荷色 #63E6BE 離純綠只有 216，勾勾、山丘、鏡片這類
  薄荷色區塊會被判成半透明，放在糖果色或深色底上會透出底色（2026-10-06 實測 12 張裡有 4 張中）。

這支改用「連通性」：貼紙一定被白邊與墨紫描邊包住，所以只挖跟外圍背景相連的區域
（加上被主體圍住的純 key 色小洞），主體內的綠色系一律保留不透明。

需要 Pillow 與 numpy，用 Codex 自帶的 python 跑就有：
  ~/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image


def _dilate(mask):
    grown = mask.copy()
    grown[1:, :] |= mask[:-1, :]
    grown[:-1, :] |= mask[1:, :]
    grown[:, 1:] |= mask[:, :-1]
    grown[:, :-1] |= mask[:, 1:]
    return grown


def rekey(src):
    rgb = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    h, w, _ = rgb.shape
    border = np.concatenate([rgb[:3].reshape(-1, 3), rgb[-3:].reshape(-1, 3),
                             rgb[:, :3].reshape(-1, 3), rgb[:, -3:].reshape(-1, 3)])
    key = np.median(border, axis=0)
    dist = np.linalg.norm(rgb - key, axis=2)

    # 背景與「背景 × 白邊」的混色；從四邊與純 key 色的小洞往外長，不越過主體
    cand = dist < 150
    bg = np.zeros_like(cand)
    bg[:2, :] = bg[-2:, :] = True
    bg[:, :2] = bg[:, -2:] = True
    bg = (bg | (dist < 60)) & cand
    while True:
        grown = _dilate(bg) & cand
        if (grown == bg).all():
            break
        bg = grown

    # 白邊與綠底的混色有一段超過 150，會留下一圈薄荷色細線；
    # 緊貼背景又偏綠的像素也併進邊緣區（主體內的薄荷色不會貼著背景）
    greenish = rgb[..., 1] > np.maximum(rgb[..., 0], rgb[..., 2]) + 15
    for _ in range(3):
        bg = bg | (_dilate(bg) & greenish)

    alpha = np.ones((h, w), np.float32)
    alpha[bg] = np.clip((dist[bg] - 30) / 300, 0, 1)

    # 邊緣 unmix：c = a·fg + (1-a)·key → fg = (c - (1-a)·key) / a，再壓掉殘綠
    out = rgb.copy()
    edge = bg & (alpha > 0)
    a = alpha[edge][:, None]
    fg = np.clip((rgb[edge] - (1 - a) * key) / np.maximum(a, 1e-3), 0, 255)
    fg[:, 1] = np.minimum(fg[:, 1], np.maximum(fg[:, 0], fg[:, 2]) + 8)
    out[edge] = fg

    rgba = np.dstack([out, alpha * 255]).round().astype(np.uint8)
    rgba[alpha * 255 < 16] = 0

    # 收尾：低 alpha 雜點歸零；半透明像素的綠色壓回 R/B 的高度（白邊變淺灰，不會變淺綠）
    rgba[rgba[..., 3] < 24] = 0
    r, g, b, a = (rgba[..., i].astype(int) for i in range(4))
    spill = (a > 0) & (a < 250) & (g > np.maximum(r, b))
    rgba[..., 1][spill] = np.maximum(r, b)[spill]
    return Image.fromarray(rgba, 'RGBA')


def fit(im, square, width, fill=0.92):
    im = im.crop(im.getbbox())
    w, h = im.size
    if square:
        scale = width * fill / max(w, h)
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
        canvas = Image.new('RGBA', (width, width), (0, 0, 0, 0))
        canvas.alpha_composite(im, ((width - im.width) // 2, (width - im.height) // 2))
        return canvas
    pad = round(max(w, h) * 0.04)
    canvas = Image.new('RGBA', (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    canvas.alpha_composite(im, (pad, pad))
    return canvas.resize((width, round(canvas.height * width / canvas.width)), Image.LANCZOS)


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    parser.add_argument('src')
    parser.add_argument('dst')
    parser.add_argument('--size', type=int, default=512, help='方形素材的邊長（預設 512）')
    parser.add_argument('--wide', type=int, help='橫圖：保留比例，輸出這個寬度')
    args = parser.parse_args()

    im = fit(rekey(args.src), square=args.wide is None, width=args.wide or args.size)
    im.save(args.dst, 'WEBP', quality=88, method=6, alpha_quality=100)

    arr = np.asarray(im).astype(int)
    partial = (arr[..., 3] > 0) & (arr[..., 3] < 250)
    fringe = partial & (arr[..., 1] > np.maximum(arr[..., 0], arr[..., 2]) + 25)
    print(f'{Path(args.dst).name}: {im.size[0]}×{im.size[1]}, '
          f'{Path(args.dst).stat().st_size / 1024:.1f} KB, 殘綠邊緣像素 {fringe.sum()}（零星幾十到一兩百是縮圖的混色，正常；上千代表 key 色沒挖乾淨）')


if __name__ == '__main__':
    main()
