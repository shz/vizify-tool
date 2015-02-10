# Vizify C++

Vizify platform implemented in C++11/OpenGL.

## Features

This library is designed to interop smoothly with the Vizify platform
and the Virgil language, which you can use if you want the things you
build to be cross-platform.

That said, it works just fine as a standalone library as well, and
provides the following:

 * Cross-platform OpenGL rendering
   * iOS
   * Android
   * OSX Desktop
   * Probably others
   * High DPI support
 * 2D drawing API inspired by HTML5 Canvas
   * Paths, curves quads, etc
   * Affine transforms, opacity, save/restore
   * Arbitrary vector scaling
   * Custom font support
   * Composition (TODO)
   * Image support (TODO)
   * Video support (TODO)
 * Nifty animation API
 * Flexible playback control
   * Play/pause/seek
   * Specific frame rendering
 * JSON parsing

## Usage

There are a few different components to the whole system, which
can be used more-or-less independently if desired.

**[vizify::Canvas](docs/canvas.md)** - OpenGL 2D rendering API<br />
**[vizify::RenderContext<T>](docs/render_context.md)** - Foundation of animation system<br />
**[vizify::Card](docs/card.md)** - Mechanism for packaging up an animation<br />
**[vizify::JSON](docs/json.md)** - JSON parsing API<br />

**[iOS Wrapper](https://git.corp.yahoo.com/vizify/vizify-ios)** - Provides easy integration into
Objective-C and Cocoa apps<br />
**Android Wrapper** - (Coming soonish) NDK integration for Android<br />

## Compiling

**Note:** This only works on OSX for now.

```bash
# These are equivalent
make
make sandbox

# Build iOS static lib, for both phone and simulator
make lib-ios

# Build lib for this platform
make lib
```

All output binaries are dropped into the `release/` folder.  Static
linking is used for libraries.

### Examples

Example ouput binaries are dropped into `release/examples/`

```bash
cd examples
make

# Each example can be built independently as well
make json
```

## The Sandbox

The best way to play around with things without having to deploy to
a device or similar tomfoolery is to use the [sandbox project](platform/sandbox).

Your rendering code defined in [render.cpp](platform/sandbox/render.cpp)
will be called every frame.  To run the app, do

```bash
make sandbox
./release/sandbox
```

## Using in other projects

The best way to make use of this library in other projects is to add
this repo as a git subtree:

```bash
git remote add vizify-cpp git@git.corp.yahoo.com:vizify/vizify-cpp.git
git subtree add --prefix vizify-cpp vizify-cpp master --squash
```

Updating can be done like this:

```bash
git subtree pull --prefix vizify-cpp vizify-cpp master --squash
```

See
http://blogs.atlassian.com/2013/05/alternatives-to-git-submodule-git-subtree/
for more details.
