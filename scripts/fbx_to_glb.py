"""
Script Blender headless: convierte todos los FBX a GLB.
Uso:
  blender --background --python scripts/fbx_to_glb.py -- <input_dir> <output_dir>
"""
import bpy
import sys
import os

# Leer args despues de '--'
argv = sys.argv
try:
    sep = argv.index('--')
    args = argv[sep + 1:]
except ValueError:
    print("ERROR: Falta -- input_dir output_dir")
    sys.exit(1)

input_dir  = args[0]
output_dir = args[1]
os.makedirs(output_dir, exist_ok=True)

converted = 0
failed    = 0

for root, dirs, files in os.walk(input_dir):
    for fname in files:
        if not fname.lower().endswith('.fbx'):
            continue
        fbx_path = os.path.join(root, fname)
        name     = os.path.splitext(fname)[0]
        glb_path = os.path.join(output_dir, name + '.glb')

        # Limpiar escena
        bpy.ops.wm.read_factory_settings(use_empty=True)

        try:
            bpy.ops.import_scene.fbx(filepath=fbx_path)
        except Exception as e:
            print(f"FAIL import {fname}: {e}")
            failed += 1
            continue

        try:
            bpy.ops.export_scene.gltf(
                filepath=glb_path,
                export_format='GLB',
                use_selection=False,
                export_apply=True,
                export_texcoords=True,
                export_normals=True,
                export_materials='EXPORT',
            )
            print(f"OK: {name}")
            converted += 1
        except Exception as e:
            print(f"FAIL export {fname}: {e}")
            failed += 1

print(f"\n=== RESULTADO ===")
print(f"Convertidos: {converted}")
print(f"Fallidos:    {failed}")
