# How to get the realistic human anatomy model

Place a file named `human-body.glb` in this folder.

## Recommended free model (matches the reference image aesthetic)

1. Go to: https://sketchfab.com/3d-models/human-anatomy-faf0f3eaec554bcf854be2038993024f
2. Click **Download** → select **GLB** format
3. Rename the file to `human-body.glb`
4. Place it here: `public/models/human-body.glb`

### Alternative (open-source, CC-BY)
- Z-Anatomy collection: https://sketchfab.com/Z-Anatomy/collections/human-anatomy-77a92b71541f4a6ab4a384ec3cf70415
- NIH 3D (public domain): https://3d.nih.gov/ → search "human body" → export as GLB

## What happens without the model

The dashboard shows a stylised 3-D primitive body (capsules/spheres) with the same
interactive markers and tooltips. Everything works — the GLTF model is purely a visual upgrade.

## After placing the file

Restart `npm run dev`. The model loads automatically with realistic skin/muscle materials
applied and all anatomical markers positioned correctly.

## Adjusting marker positions for your specific model

If the markers are slightly off for your model, edit `HOTSPOT_3D` in
`src/components/dashboard/Body3DScene.tsx`:

```ts
const HOTSPOT_3D: Record<string, [number, number, number]> = {
  head:    [ 0.12,  1.72, 0.12],   // [x, y, z] in body-local space
  heart:   [-0.07,  1.22, 0.15],
  lung:    [ 0.09,  1.22, 0.15],
  abdomen: [ 0.00,  0.90, 0.15],
};
```
