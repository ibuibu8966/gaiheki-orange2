from PIL import Image, ImageDraw
import os

# 画像のパス
images = {
    'bookmark': r'C:\Users\ibuki\Dropbox\プログラム系\Next.js\Gaiheki\参照\Generated Image October 22, 2025 - 10_16PM.png',
    'profile': r'C:\Users\ibuki\Dropbox\プログラム系\Next.js\Gaiheki\参照\Generated Image October 22, 2025 - 10_12PM.png',
    'home': r'C:\Users\ibuki\Dropbox\プログラム系\Next.js\Gaiheki\参照\Generated Image October 22, 2025 - 10_13PM.png'
}

output_dir = r'C:\Users\ibuki\Dropbox\プログラム系\Next.js\Gaiheki\public\icons'

def add_rounded_corners(img, radius):
    """画像に角丸を適用"""
    # マスクを作成
    mask = Image.new('L', img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), img.size], radius=radius, fill=255)

    # 透過チャンネルを持つ画像に変換
    img = img.convert('RGBA')
    img.putalpha(mask)

    return img

for name, path in images.items():
    # 画像を開く
    img = Image.open(path)
    width, height = img.size
    print(f'{name}: {width}x{height}')

    # アイコンボックスを中央に配置
    # より中央寄りに調整
    box_width = 240
    box_height = 240
    left = (width - box_width) // 2
    top = 200  # より中央に
    right = left + box_width
    bottom = top + box_height

    # 切り取り
    cropped = img.crop((left, top, right, bottom))

    # 角丸を適用（半径20px）
    cropped_rounded = add_rounded_corners(cropped, radius=20)

    # 保存
    output_path = os.path.join(output_dir, f'{name}-icon.png')
    cropped_rounded.save(output_path)
    print(f'Saved: {output_path} (size: {cropped_rounded.size}, rounded corners)')

print('\nAll icons cropped and rounded successfully!')
