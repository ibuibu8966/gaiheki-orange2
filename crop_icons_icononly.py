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
    # 画像サイズ: 1536x672
    # ボックスは中央、高さ460pxあたりまで

    # より小さく、文字を完全に除外
    box_width = 320
    box_height = 320
    left = (width - box_width) // 2
    top = 160  # 上部から
    right = left + box_width
    bottom = top + box_height  # 文字が入る前まで

    # 切り取り
    cropped = img.crop((left, top, right, bottom))

    # 保存
    output_path = os.path.join(output_dir, f'{name}-icon.png')
    cropped.save(output_path)
    print(f'Saved: {output_path} (cropped from {left},{top} to {right},{bottom})')

print('\nAll icons cropped successfully!')
