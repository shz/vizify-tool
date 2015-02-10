#include <stdexcept>
#include <iostream>

#include "../include/vizify/canvas.hpp"
#include "../deps/nanovg/nanovg.c"
#include "../deps/nanovg/nanovg_gl.h"
#include "../deps/nanovg/nanovg_gl_utils.h"

namespace vizify
{

  CanvasFrame::CanvasFrame(Canvas& c)
  : canvas(c)
  {
    c.start();
  }
  CanvasFrame::~CanvasFrame()
  {
    this->canvas.finish();
  }

  Canvas::Canvas(int width, int height)
  : width(width), height(height), fillStyle(new Color(0.0f, 0.0f, 0.0f, 1.0f))
  , strokeStyle(new Color(0.0f, 0.0f, 0.0f, 1.0f)), lineWidth(1.0f), fontSize(0), vg(0)
  {
    #if defined (NANOVG_GLES2_IMPLEMENTATION)
      this->vg = nvgCreateGLES2(NVG_ANTIALIAS);
    #elif defined (NANOVG_GL2_IMPLEMENTATION)
      this->vg = nvgCreateGL2(NVG_ANTIALIAS);
    #endif

    this->maskMode = "normal";

    if (!this->vg)
      throw std::runtime_error("Unable to initialize OpenGL");
  }

  Canvas::Canvas(int width, int height, double scale)
  : width(width), height(height), sizeScale(scale), fillStyle(new Color(0.0f, 0.0f, 0.0f, 1.0f))
  , strokeStyle(new Color(0.0f, 0.0f, 0.0f, 1.0f)), lineWidth(1.0f), fontSize(0), vg(0)
  {
    // TODO - delegate to other constructor
    #if defined (NANOVG_GLES2_IMPLEMENTATION)
      this->vg = nvgCreateGLES2(NVG_ANTIALIAS);
    #elif defined (NANOVG_GL2_IMPLEMENTATION)
      this->vg = nvgCreateGL2(NVG_ANTIALIAS);
    #endif

    this->maskMode = "normal";

    if (!this->vg)
      throw std::runtime_error("Unable to initialize OpenGL");
  }

  Canvas::~Canvas()
  {
    #if defined (NANOVG_GLES2_IMPLEMENTATION)
      nvgDeleteGLES2(this->vg);
    #elif defined (NANOVG_GL2_IMPLEMENTATION)
      nvgDeleteGL2(this->vg);
    #endif

    this->vg = 0;
  }

  void Canvas::resize(int width, int height, double scale)
  {
    this->width = width;
    this->height = height;
    this->sizeScale = scale;
  }

  void Canvas::resize(int width, int height)
  {
    this->resize(width, height, this->sizeScale);
  }

  void Canvas::start()
  {
    glClearColor(0.5f, 0.5f, 0.5f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
    nvgBeginFrame(this->vg,
      this->width,
      this->height,
      this->sizeScale);
  }

  void Canvas::finish()
  {
    nvgEndFrame(this->vg);
  }

  Color* Canvas::getFillStyle()
  {
    return this->fillStyle;
  }

  void Canvas::setFillStyle(Color* c)
  {
    this->fillStyle = c;
    nvgFillColor(this->vg, nvgRGBAf(c->r, c->g, c->b, c->a));
  }

  void Canvas::setFillStyle(double r, double g, double b)
  {
    this->setFillStyle(new Color(r, g, b));
  }

  void Canvas::setFillStyle(double r, double g, double b, double a)
  {
    this->setFillStyle(new Color(r, g, b, a));
  }

  Color* Canvas::getStrokeStyle()
  {
    return this->strokeStyle;
  }

  void Canvas::setStrokeStyle(Color* c)
  {
    this->strokeStyle = c;
    nvgStrokeColor(this->vg, nvgRGBAf(c->r, c->g, c->b, c->a));
  }

  void Canvas::setStrokeStyle(double r, double g, double b)
  {
    this->setStrokeStyle(new Color(r, g, b));
  }

  void Canvas::setStrokeStyle(double r, double g, double b, double a)
  {
    this->setStrokeStyle(new Color(r, g, b));
  }

  void Canvas::setGlobalMaskMode(const std::string& mode)  // "normal", "mask", "reverse_mask"
  {
    if (mode == "normal") {
      glStencilFunc(GL_ALWAYS, 1, 0xFF);
    }
    else if (mode == "mask") {
      glStencilFunc(GL_EQUAL, 1, 0xFF);
    }
    else if (mode == "reverse_mask") {
      glStencilFunc(GL_NOTEQUAL, 1, 0xFF);
    }
    else {
      // We intentionally do not update this->maskMode in this error case.
      return;
    }
    
    this->maskMode = mode;
  }

  void Canvas::setGlobalAlpha(double a)
  {
    this->globalAlpha = a;
    nvgGlobalAlpha(this->vg, a);
  }
  double Canvas::getGlobalAlpha()
  {
      return this->globalAlpha;
  }

  void Canvas::startClip(int x, int y, int w, int h)
  {
    nvgScissor(this->vg, x, y, w, h);
  }

  void Canvas::endClip()
  {
    nvgResetScissor(this->vg);
  }

  void Canvas::setLineWidth(double w)
  {
    this->lineWidth = w;
    nvgStrokeWidth(this->vg, w);
  }

  // TODO: no-op for now.
  void Canvas::setLineDash(std::vector<int>* dashspec)
  {
  }

  // TODO:
  void Canvas::setFont(const std::string& fontFamily, int fontSize)
  {
    // throw std::runtime_error("Not implemented");
    nvgFontFace(this->vg, "Liberation Sans");
    nvgFontSize(this->vg, fontSize);
  }

  void Canvas::scale(double x, double y)
  {
    nvgScale(this->vg, x, y);
  }

  void Canvas::scale(double s)
  {
    this->scale(s, s);
  }

  void Canvas::rotate(double t)
  {
    nvgRotate(this->vg, t);
  }

  void Canvas::translate(double x, double y)
  {
    nvgTranslate(this->vg, x, y);
  }

  void Canvas::clearRect(double x, double y, double w, double h)
  {
    setFillStyle(0, 0, 0, 255.0f);
    fillRect(x, y, w, h);
  }

  void Canvas::fillRect(double x, double y, double w, double h)
  {
    nvgBeginPath(this->vg);
    nvgRect(this->vg, x, y, w, h);
    nvgFill(this->vg);
  }

  void Canvas::strokeRect(double x, double y, double w, double h)
  {
    nvgBeginPath(this->vg);
    nvgRect(this->vg, x, y, w, h);
    nvgStroke(this->vg);
  }

  void Canvas::fillText(const std::string& text, double x, double y)
  {
    // nvgFontFace(this->vg, this->fontFamily);
    // nvgFontSize(this->vg, (double)this->fontSize);
    nvgText(this->vg, x, y, text.c_str(), 0);
  }

  double Canvas::measureTextWidth(const std::string& text)
  {
    float bounds[4];
    const char *temp = text.c_str();
    const char *end = temp + text.length();
    nvgTextBounds(this->vg, 0, 0, temp, end, bounds);
    return bounds[2];
  }

  void Canvas::beginPath()
  {
    nvgBeginPath(this->vg);
  }

  void Canvas::closePath()
  {
    nvgClosePath(this->vg);
  }

  void Canvas::moveTo(double x, double y)
  {
    nvgMoveTo(this->vg, x, y);
  }

  void Canvas::lineTo(double x, double y)
  {
    nvgLineTo(this->vg, x, y);
  }

  void Canvas::fill()
  {
    nvgFill(this->vg);
  }

  void Canvas::stroke()
  {
    nvgStroke(this->vg);
  }

  void Canvas::ellipse(double cx, double cy, double rx, double ry)
  {
    nvgEllipse(this->vg, cx, cy, rx, ry);
  }

  void Canvas::rect(double x, double y, double w, double h)
  {
    nvgRect(this->vg, x, y, w, h);
  }

  void Canvas::arc(double cx, double cy, double r, double a0, double a1, bool counterClockwise)
  {
    int dir = counterClockwise ? NVG_CCW : NVG_CW;
    nvgArc(this->vg, cx, cy, r, a0, a1, dir);
  }

  void Canvas::arcTo(double x1, double y1, double x2, double y2, double radius)
  {
    nvgArcTo(this->vg, x1, y1, x2, y2, radius);
  }

  void Canvas::bezierCurveTo(double c1x, double c1y, double c2x, double c2y, double x, double y)
  {
    nvgBezierTo(this->vg, c1x, c1y, c2x, c2y, x, y);
  }

  void Canvas::quadraticCurveTo(double cx, double cy, double x, double y)
  {
    nvgQuadTo(this->vg, cx, cy, x, y);
  }

  void Canvas::drawImage(Image* img, double x, double y)
  {
    NVGpaint imgPaint = nvgImagePattern(this->vg, x, y, img->width, img->height, 0.0f/180.0f*NVG_PI, img->handle, NVG_NOREPEAT, 1.0f);
    nvgBeginPath(this->vg);
    nvgRect(this->vg, x, y, img->width, img->height);  // todo: should be dWidth/dHeight
    nvgFillPaint(this->vg, imgPaint);
    nvgFill(this->vg);
  }
  void Canvas::drawImage(const std::string& img, double x, double y)
  {
    // TODO
  }
  void Canvas::drawImageSized(const std::string& img, double x, double y, double w, double h)
  {
    // TODO
  }
  void Canvas::drawImageSized(Image* img, double x, double y, double w, double h)
  {
    NVGpaint imgPaint = nvgImagePattern(this->vg, x, y, img->width, img->height, 0.0f/180.0f*NVG_PI, img->handle, NVG_NOREPEAT, 1.0f);
    nvgBeginPath(this->vg);
    nvgRect(this->vg, x, y, w, h);  // todo: should be dWidth/dHeight
    nvgFillPaint(this->vg, imgPaint);
    nvgFill(this->vg);
  }

  void Canvas::save()
  {
    this->globalAlphaStack.push(this->globalAlpha);
    nvgSave(this->vg);
  }

  void Canvas::restore()
  {
    nvgRestore(this->vg);
    this->setGlobalAlpha(this->globalAlphaStack.top());
    this->globalAlphaStack.pop();
  }

  void Canvas::loadFont(const std::string& name, const std::string& filename)
  {
    int handle = nvgCreateFont(this->vg, name.c_str(), filename.c_str());
    if (handle < 0)
      throw std::runtime_error("Unable to load font '" + name + "' (" + filename + ")");
  }
}
