#ifndef VIZIFY_IMAGE_H
#define VIZIFY_IMAGE_H

#include <string>
#include "../../deps/nanovg/nanovg.h"

namespace vizify
{
  class Image
  {
    public:
      Image(NVGcontext *ctx, const std::string& filename);
      ~Image();

      int width = 0;
      int height = 0;
      int handle = 0;
      NVGcontext *ctx = nullptr;

    private:
      Image(const Image& other);
      Image& operator=(const Image other);
      Image(Image&& other);
      Image& operator=(Image&& other);
  };
}

#endif
