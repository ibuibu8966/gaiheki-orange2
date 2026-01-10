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

    # アイコンボタンだけを切り取る（文字の上の部分）
    # 画像サイズ: 1536x672
    # アイコンボタンは中央上部、文字の上にある

    # より小さく、アイコンボタンのみを切り取る
    box_size = 300  # ボタンのサイズ
    left = (width - box_size) // 2
    top = 160  # 文字を避けて上部のみ
    right = left + box_size
    bottom = top + box_size

    # 切り取り
    cropped = img.crop((left, top, right, bottom))

    # 保存
    output_path = os.path.join(output_dir, f'{name}-icon.png')
    cropped.save(output_path)
    print(f'Saved: {output_path} (size: {cropped.size})')

print('\nAll icons cropped successfully!')
