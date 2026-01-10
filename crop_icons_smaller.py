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
    print(f'{name}: {width}x{height}')

    # より小さく、ダークボックスのみ
    box_width = 220
    box_height = 220
    left = (width - box_width) // 2
    top = 180  # もう少し下から
    right = left + box_width
    bottom = top + box_height

    # 切り取り
    cropped = img.crop((left, top, right, bottom))

    # 保存
    output_path = os.path.join(output_dir, f'{name}-icon.png')
    cropped.save(output_path)
    print(f'Saved: {output_path} (size: {cropped.size})')

print('\nAll icons cropped successfully!')
