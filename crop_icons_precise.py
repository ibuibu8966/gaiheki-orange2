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

    # アイコンボタンの部分を切り取る
    # 画像の中央上部にアイコンがあると仮定
    # より正確に、ダークな角丸四角形の部分を切り取る

    # 中央のアイコンボックス（約300x300ピクセル程度）
    box_size = 400  # アイコンボックスのサイズ
    left = (width - box_size) // 2
    top = 150  # 上から150pxあたり
    right = left + box_size
    bottom = top + box_size

    # 切り取り
    cropped = img.crop((left, top, right, bottom))

    # 保存
    output_path = os.path.join(output_dir, f'{name}-icon.png')
    cropped.save(output_path)
    print(f'Saved: {output_path} (size: {cropped.size})')

print('\nAll icons cropped successfully!')
