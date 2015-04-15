#ifndef VIZIFY_CANVAS_H
#define VIZIFY_CANVAS_H

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
#include "image.hpp"
#include "gradient_spec.hpp"
#include "color.hpp"

namespace vizify
{
  class Canvas
  {
    public:
    Canvas(int width, int height);
    Canvas(int width, int height, double scale);
    Canvas();
    ~Canvas();

    void start();
    void finish();
    void resize(int width, int height);
    void resize(int width, int height, double scale);

    Color* getFillColor();
    void setFillColor(Color* c);
    void setFillColor(double r, double g, double b);
    void setFillColor(double r, double g, double b, double a);

    void setFillGradient(GradientSpec* gspec);

    Color* getStrokeColor();
    void setStrokeColor(Color* c);
    void setStrokeColor(double r, double g, double b);
    void setStrokeColor(double r, double g, double b, double a);

    void setStrokeGradient(GradientSpec* gspec);

    GradientSpec* createLinearGradient(double xStart, double yStart, double xEnd, double yEnd, Color* stop0, Color* stop1);
    GradientSpec* createRadialGradient(double xCenter, double yCenter, double radiusInner, double radiusOuter, Color* stop0, Color* stop1);

    double getGlobalAlpha();
    void setGlobalAlpha(double a);
    void setLineWidth(double w);

    void setGlobalMaskMode(const std::string& mode);  // "normal", "mask", "reverse_mask"

    void setLineDash(std::vector<int>* dashspec);
    void setFont(const std::string& fontFamily, int fontSize);
    void fillRect(double x, double y, double w, double h);

    // void labForStencils();

    void startClip(int x, int y, int w, int h);
    void endClip();

    // not used currently
    void strokeRect(double x, double y, double w, double h);
    void clearRect(double x, double y, double w, double h);

    void beginPath();
    void closePath();
    void stroke();
    void fill();

    void save();
    void restore();

    void drawImage(Image* img, double x, double y);
    void drawImage(const std::string& img, double x, double y);
    void drawImageSized(Image* img, double x, double y, double w, double h);
    void drawImageSized(const std::string& img, double x, double y, double w, double h);

    void translate(double x, double y);
    void scale(double x, double y);
    void scale(double s);
    void rotate(double t);

    // TODO
    void rect(double x, double y, double w, double h);

    void arc(double cx, double cy, double r, double a0, double a1, bool clockwise);
    void arcTo(double x1, double y1, double x2, double y2, double radius);
    void bezierCurveTo(double c1x, double c1y, double c2x, double c2y, double x, double y);
    void quadraticCurveTo(double cx, double cy, double x, double y);
    void moveTo(double x, double y);
    void lineTo(double x, double y);
    void ellipse(double cx, double cy, double rx, double ry);
    void fillText(const std::string& text, double x, double y);
    double measureTextWidth(const std::string& text);

    int width = 0;
    int height = 0;
    int fontSize = 0;
    char const *fontFamily;
    double globalAlpha = 1;

    // Internal stuff

    void loadFont(const std::string& name, const std::string& filename);

    NVGcontext *vg;

  private:
    Canvas(const Canvas& other);
    Canvas& operator= (Canvas other);

    Color* fillStyle;
    Color* strokeStyle;
    double lineWidth;
    std::stack<double> globalAlphaStack;
    std::string maskMode;
    double sizeScale = 1.0f;
  };

  class CanvasFrame
  {
  public:
    CanvasFrame(Canvas& c);
    ~CanvasFrame();

  private:
    Canvas& canvas;
  };
}

#endif
