from PIL import Image
import os

# 画像のパス
images = {
    'bookmark': r'C:\Users\ibuki\Dropbox\プログラム系\Next.js\Gaiheki\参照\Generated Image October 22, 2025 - 10_16PM.png',
    'profile': r'C:\Users\ibuki\Dropbox\プログラム系\Next.js\Gaiheki\参照\Generated Image October 22, 2025 - 10_12PM.png',
    'home': r'C:\Users\ibuki\Dropbox\プログラム系\Next.js\Gaiheki\参照\Generated Image October 22, 2025 - 10_13PM.png'
}

output_dir = r'C:\Users\ibuki\Dropbox\プログラム系\Next.js\Gaiheki\public\icons'

for name, path in images.items():
    # 画像を開く
    img = Image.open(path)
    width, height = img.size

    # 中央のアイコン部分を切り取る（画像の中央付近）
    # アイコンは画像の中央に配置されていると仮定
    # 画像サイズに応じて調整
    icon_size = min(width, height) // 2
    left = (width - icon_size) // 2
    top = (height - icon_size) // 2 - 50  # 少し上にずらす
    right = left + icon_size
    bottom = top + icon_size

    # 切り取り
    cropped = img.crop((left, top, right, bottom))

    # 保存
    output_path = os.path.join(output_dir, f'{name}-icon.png')
    cropped.save(output_path)
    print(f'Saved: {output_path}')

print('All icons cropped successfully!')
