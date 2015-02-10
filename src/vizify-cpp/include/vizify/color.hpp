#ifndef VIZIFY_COLOR_H
#define VIZIFY_COLOR_H

namespace vizify
{
  class Color
  {
    public:
      Color() {}
      Color(double r, double g, double b) : r(r), g(g), b(b) {}
      Color(double r, double g, double b, double a) : r(r), g(g), b(b), a(a) {}

      double a = 1.0f;
      double r = 0.0f;
      double g = 0.0f;
      double b = 0.0f;
  };
}

#endif
