#include "../include/vizify/image.hpp"

namespace vizify
{
  Image::Image(NVGcontext *ctx, const std::string& filename)
  : ctx(ctx)
  {
    this->handle = nvgCreateImage(ctx, filename.c_str(), 0);
    if (!this->handle)
      throw std::runtime_error("Unable to load image " + filename);
    nvgImageSize(ctx, this->handle, &this->width, &this->height);
  }

  Image::~Image()
  {
    if (this->handle != 0) {
      nvgDeleteImage(this->ctx, this->handle);
      this->handle = 0;
    }
  }
}
