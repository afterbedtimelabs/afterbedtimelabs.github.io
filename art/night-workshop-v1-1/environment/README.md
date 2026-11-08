# Night environment assembly

This is an environment-only edit of the owner-reviewed V1 scene. The complete V1 source remains at `art/ambient-v1/rainy-workshop-v1.png`. Character posing is a separate assembly stage.

Run from the V1.1 checkout:

```powershell
node scripts/assemble-night-environment.mjs
```

The script uses the existing Sharp dependency. It writes the lossless runtime WebP, the window motion mask, the full PNG composite, and reproducibility/inspection records here. It does not modify the V1 source.

## Editable inputs and outputs

- `generated-night-clean.png`: original built-in image-generation output, used as environmental source material only.
- `registered-night-clean.png`: nearest-neighbor registration to the V1 coordinate system, with the extra lower image area cropped. The exact scale and crop are recorded in `assembly.json`.
- `glass-panes.svg`: broad window region used by the selection algorithm.
- `exterior-mask.png`: exact source-derived glass selection. Original warm foreground contours and window mullions are excluded. This is also exported as the runtime rain mask.
- `generated-interior-mask.png`: inset/feathered mask that keeps generated registration drift away from original foreground edges.
- `steam-removal-mask.svg` and `.png`: narrow painted-plume removal area crossing the glass and sill.
- `clean-sill-patch.png`: reconstructed sill source patch, registered at x1330, y540; its working size is 110×80. The original horizontal sill edges are retained by reconstructing each scanline from clean samples on either side.
- `night-environment.png`: assembled 1659×948 scene. Runtime export: `public/images/ambient/night-workshop-v1-1.webp`.
- `preservation-checks.json`: direct original/composite pixel comparison for protected interior regions and all pixels outside the explicit edit masks.

The blue-black exterior, subdued blossoms, smaller warm window selection, and limited reflections come from the generated plate. The original is selectively graded within the narrow exterior transition band. There is no full-scene dark overlay. Tinker, his face, scarf, paws, tail, laptop, desk and lamp continue to use the original artwork.

The former conspicuous painted rain streaks and steam ribbon are removed from the open glass. A few dim stationary glass marks remain in the narrow original boundary band; these read as water on the glass and preserve the original pixel contours. New visual rain should use the supplied luminance mask, and steam should originate at approximately (1365,616). The masked composite has been inspected at native dimensions and with 3× nearest-neighbor crops around the laptop, sill, and former steam region. Final browser artistic review and owner approval remain separate from these asset checks.
