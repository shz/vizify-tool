#ifndef VIZIFY_RENDER_CONTEXT_H
#define VIZIFY_RENDER_CONTEXT_H

#include <iostream>
#include <memory>
#include <vector>
#include <functional>
#include "clock.hpp"
#include "canvas.hpp"

namespace vizify
{

  class Config
  {
  public:
      Config() {
        this->operations = new std::vector<std::function<void(Canvas*, Clock*)>>;
      }
      Config(const Config& other)
        : start(other.start)
        , end(other.end)
        , duration(other.duration)
        , operations(new std::vector<std::function<void(Canvas*, Clock*)>>(*other.operations))
      {}
      ~Config() {
        delete this->operations;
      }

      int start = 0;
      int end = 0;
      int duration = -1;
      std::vector<std::function<void(Canvas*, Clock*)>>* operations;
  };

  template <typename T>
  class RenderContext
  {
    // TODO - Friend the runner class

    public:
      RenderContext(Canvas* _c) : c(_c), clock(new Clock()), config(new Config()), data(nullptr) {}
      RenderContext(Canvas* _c, T d) : c(_c), data(d), clock(new Clock()), config(new Config()) {}
      RenderContext(const RenderContext& other)
        : c(other.c)
        , data(other.data)
        , clock(new Clock(*other.clock))
        , config(new Config(*other.config))
      {}

      ~RenderContext() {
        delete this->clock;  this->clock = nullptr;
        delete this->config;  this->config = nullptr;
      }

      Canvas* c;
      Clock* clock;
      T data;
      Config* config;

      RenderContext<T> *fork()
      {
        return new RenderContext<T>(*this);
      }

      void update(int elapsed, int total)
      {
        this->clock->fromStart = elapsed;
        this->clock->fromEnd = total - elapsed;
        this->clock->percent = elapsed / (total * 1.0f);
      }
  };

  template <>
  class RenderContext<void>
  {
    public:
      RenderContext(Canvas* _c) : c(_c), clock(new Clock()), config(new Config()) {}
      RenderContext(const RenderContext& other)
        : c(other.c)
        , clock(new Clock(*other.clock))
        , config(new Config(*other.config))
      {}

      ~RenderContext() {
        delete this->clock;  this->clock = nullptr;
        delete this->config;  this->config = nullptr;
      }

      Canvas* c;
      Clock* clock;
      Config* config;

      RenderContext<void> *fork()
      {
        return new RenderContext<void>(*this);
      }

      void update(int elapsed, int total)
      {
        this->clock->fromStart = elapsed;
        this->clock->fromEnd = total - elapsed;
        this->clock->percent = elapsed / (total * 1.0f);
      }
  };
}

#endif
