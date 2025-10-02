from PIL import Image

icon = Image.new('RGBA', (512, 512), color=(37, 99, 235, 255))
icon.save('assets/images/icon.png')

favicon = Image.new('RGBA', (32, 32), color=(37, 99, 235, 255))
favicon.save('assets/images/favicon.png')

print("Images created successfully")
