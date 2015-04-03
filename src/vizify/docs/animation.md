# Animation

## Example

```python
function renderer(rc: RenderContext<Data, Layout>) {
  # The RenderContext's .tween() method sets up an Animation<'T> object
  # Using the specified in/out animations. In this case, we're using
  # a 500ms linear function to tween in, and a 0ms linear function to
  # tween out.
  let anim = rc.tween(linear(500), linear(0))

  # Once you have an animation, you can perform an action using the
  # tweened value by calling the .perform() method. You will receive
  # your canvas to apply your animation on, and a float in [0-1]
  # indicating the % through the animation. Note that you DON'T do
  # drawing in this perform method; you just set up to draw instead.
  let childRc = anim.perform(lambda (c: Canvas, progress: float) {
    c.setGlobalAlpha(progress)
  })

  # Drawing is, as usual, done through the RenderContext's .apply() method
  childRc.apply(...) # This will have a fade applied

  # You can also define methods on Animation<'T> itself to do the work
  # for you. Several default are provided, and they all just use
  #

  # In the examples above we used separate variables, but the idea is
  # really to chain these instead. This example combines a linear
  # fade and a linear translateX, and then draws the next object.
  rc.tween(linear(500), ease(0)).fade().
    tween(linear(500), ease(0)).translate(100f, 0f).
    apply(myDrawingFunction)

  # Here's a more complex example. This will wait 100ms, ease fade in
  # for 100ms, draw the object, ease fade out for 100ms, and hide the
  # object 100ms before the end.
  rc.delay(100).until(100).
    tween(ease(100), ease(100)).fade().
    apply(myDrawingFunction)

  # What if you want to add some pauses in there?  For example, lets
  # say you want to wait a bit before or after applying your ease.
  # There's a utility for that! In this example, we wait 500ms BEFORE
  # doing a 100ms linear tween in, and also wait 500ms AFTER doing
  # a 100ms ease tween out.
  let anim2 = rc.tween( wait(500, linear(100))
                      , wait(500, ease(100))
                      )
}
```

## Tweening Functions

See [tweening.vgl](../tweening.vgl#82) for full list/implementation.

 * `linear(duration)` - [Linear](http://cubic-bezier.com/#0,0,1,1)
 * `ease(duration)` - [Ease](http://cubic-bezier.com/#.25,.1,.25,1)
 * `easeIn(duration)` - [Ease in](http://cubic-bezier.com/#.42,0,1,1)
 * `easeOut(duration)` - [Ease out](http://cubic-bezier.com/#0,0,.58,1)
 * `easeInOut(duration)` - [Ease inout](http://cubic-bezier.com/#.42,0,.58,1)
 * `easeCustom(duration, cubicBezier(x1, y1, x2, y2))` - Custom

### Defining your own tween

Tweening functions might look a bit scary at first glance, but they're
really pretty simple once you grasp the basics.

#### The Basics

Tweening function are really quite basic; here's the signature:

```python
function someTween(t: int) : float
```

These functions take an integer timestamp into the tween, and return
a float `[0-1]` that specifies how to tween the value.

In most cases, you'll want to use a "generator" function of sorts, in
order to have configurable lengths. For example:

```python
function linear(duration: int) : func<int, float> {
  let df = duration.asFloat()
  return lambda(time: int) : float {
    return df / time
  }
}
```

The outer function takes a `duration` parameter specifying the maximum
time of the tween, and the function it returns simply calculates what
percentage of `duration` is used up the by the current time.

#### Cubic Bezier Tweens

There is a utility function available to let you easily create cubic
bezier based tweens. Here's an example:

```python
export function easeIn(d: int) : func<int, float> {
  let cb = cubicBezier(0.42, 0f, 1f, 1f)

  return lambda(t: int) : float {
    return cb.at(t.asFloat() / d.asFloat())
  }
}
```

*Shortcut*: An `easeCustom()` function is provided for you, and can be
            used like this:

```python
easeCustom(duration, cubicBezier(0f, 0f, 1f, 1f))
```

How do you determine those four parameters to pass to `cubicBezier`?
A good tool is [cubic-bezier.com](http://cubic-bezier.com).

