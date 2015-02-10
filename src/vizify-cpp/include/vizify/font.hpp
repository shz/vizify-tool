#ifndef VIZIFY_FONT_H
#define VIZIFY_FONT_H

#include <string>
#include "../../deps/nanovg/nanovg.h"

namespace vizify
{
  class Font
  {
    public:
      Font(NVGcontext *ctx, const std::string& name, const std::string& filename);
      ~Font();

      int handle = 0;
      NVGcontext *ctx = nullptr;

    private:
      Font(const Font& other);
      Font& operator=(const Font other);
      Font(Font&& other);
      Font& operator=(Font&& other);
  };
}

#endif
