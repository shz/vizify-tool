#include "../include/vizify/gradient_spec.hpp"

namespace vizify
{
  void GradientSpec::setLinear(NVGcontext* ctx, double xStart, double yStart, double xEnd, double yEnd, NVGcolor stop0, NVGcolor stop1)
  {
    this->structPaint = nvgLinearGradient(ctx, xStart, yStart, xEnd, yEnd, stop0, stop1);
  }

  void GradientSpec::setRadial(NVGcontext* ctx, double xCenter, double yCenter, double radiusInner, double radiusOuter, NVGcolor stop0, NVGcolor stop1)
  {
    this->structPaint = nvgRadialGradient(ctx, xCenter, yCenter,  radiusInner, radiusOuter, stop0, stop1);
  }
}
