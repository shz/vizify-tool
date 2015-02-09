#include "../include/vizify/font.hpp"

namespace vizify
{
  Font::Font(NVGcontext *ctx, const std::string& name, const std::string& filename)
  {
    this->handle = nvgCreateFont(ctx, name.c_str(), filename.c_str());
    if (this->handle < 0)
      throw std::runtime_error("Unable to load font '" + name + "' (" + filename + ")");
  }
  
  Font::~Font()
  {
  }
}
