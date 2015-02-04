#ifndef VIZIFY_CARD_CONFIG_H
#define VIZIFY_CARD_CONFIG_H

#include "render_context.hpp"

namespace vizify
{
  template <typename T>
  class CardConfig
  {
    public:
      CardConfig(T d, int dur, std::function<void(RenderContext<T>*)> r)
      : data(d), duration(dur), renderer(r) {}
      CardConfig(T d, std::function<void(RenderContext<T>*)> r)
      : data(d), duration(0), renderer(r) {}
      CardConfig()
      : data(nullptr), duration(0), renderer(nullptr) {}

      T data;
      int duration;
      std::function<void(RenderContext<T>*)> renderer;
      std::vector<std::string>* images = new std::vector<std::string>();
  };

  // Add constructors for CardConfig<void> that let the user omit the
  // data argument in the constructor.
  template <>
  class CardConfig<void>
  {
    public:
      CardConfig(int dur, std::function<void(RenderContext<void>*)> r)
      : duration(dur), renderer(r) {}
      CardConfig(std::function<void(RenderContext<void>*)> r)
      : duration(0), renderer(r) {}
      CardConfig()
      : duration(0), renderer(nullptr) {}

      int duration;
      std::function<void(RenderContext<void>*)> renderer;
  };
}

#endif
