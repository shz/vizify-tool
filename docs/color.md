# Color

A basic `Color` class is provided, with a few utility helpers.  Note
that the rgba values stored in a `Color` should be floats in the range
0 - 1.

As an alternative to instantiating a `Color` directly, you can use the
`rgb` and `rgba` helper functions instead.  Both of these take their
rgb parameters as ints in the range 0-255.  The `a` parameter for `rgba`
remains a float in the range 0-1.

## Example

```python
# A few different ways to create colors
let c1 = new Color {
  r = 1f
  g = 0f
  b = 0f
  a = 1f
}
let c2 = rgb(255, 128, 0)
let c2 = rgba(255, 128, 0, 0.5)

# Interpolation
let between = interpolate(
  rgb(255, 0, 0)
  rgb(0, 255, 0)
)
```
