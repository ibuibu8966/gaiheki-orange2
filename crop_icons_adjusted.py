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

    # ダークボックスとアイコンのみを切り取る
    # より正確に、ボックスの位置を計算
    # 画像の高さは672px、ボックスは約160pxから始まり、300pxくらいの高さ

    box_width = 280
    box_height = 280
    left = (width - box_width) // 2
    top = 165  # ボックスの開始位置
    right = left + box_width
    bottom = top + box_height  # ボックスの終了位置（文字の前）

    # 切り取り
    cropped = img.crop((left, top, right, bottom))

    # 保存
    output_path = os.path.join(output_dir, f'{name}-icon.png')
    cropped.save(output_path)
    print(f'Saved: {output_path} (cropped from {left},{top} to {right},{bottom}, size: {cropped.size})')

print('\nAll icons cropped successfully!')
