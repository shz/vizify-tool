#ifndef VIZIFY_GRADIENT_SPEC_H
#define VIZIFY_GRADIENT_SPEC_H

#include <string>
#include <map>
#include <vector>
#include <stack>

#ifdef __APPLE__
  #include <TargetConditionals.h>

  #if TARGET_OS_IPHONE || TARGET_IPHONE_SIMULATOR
    #define NANOVG_GLES2_IMPLEMENTATION
    #include <OpenGLES/ES2/gl.h>
  #elif TARGET_OS_MAC
    #define NANOVG_GL2_IMPLEMENTATION
    #include <OpenGL/gl.h>
    #include <OpenGL/glu.h>
  #else
    #error "Don't know how to set up OpenGL for this platform"
  #endif
#else
  #error "Don't know how to set up OpenGL for this platform"
#endif

#include "../../deps/nanovg/nanovg.h"
#include "color.hpp"

namespace vizify
{

  class GradientSpec
  {
    /* Note the constructor is private.  Instances of this class are not intended for construction by
       any class/application other than the Canvas.  Vizify applications will not be allowed to 
       construct this class via the "new" keyword.  The Canvas is the only "user" of this class and
       will always construct via 2-step process:  "new" followed by a call to either setLinear or setRadial.
    */
    friend class Canvas;
    private:
      GradientSpec() {};


      void setLinear(NVGcontext*, double xStart, double yStart, double xEnd, double yEnd, NVGcolor stop0, NVGcolor stop1);
      void setRadial(NVGcontext*, double xCenter, double yCenter, double radiusInner, double radiusOuter, NVGcolor stop0, NVGcolor stop1);

      NVGpaint inqValue() { return structPaint; }

      // Constructor does not initialize.
      // The caller (always a member function of Canvas) will always init this immediately via setLinear or setRadial.
      NVGpaint structPaint;  
  };

}

#endif
