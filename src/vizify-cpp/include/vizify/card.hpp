#ifndef VIZIFY_CARD_H
#define VIZIFY_CARD_H

#include <functional>
#include <memory>
#include <unordered_map>
#include <string>

#include "image.hpp"
#include "font.hpp"
#include "clock.hpp"
#include "render_context.hpp"
#include "card_config.hpp"

namespace vizify
{
  class Card
  {
    public:
      // The only constructor we offer takes the creation function
      // itself, rather than just the CardConfig<T>, so that it can
      // control the context around the call of the creation function.
      template <typename T>
      Card(CardConfig<T> *(*creator)(const std::string&), const std::string& json);
      // We also offer a version that does not need any initialization JSON
      Card(CardConfig<void> *(*creator)());

      // We need to manually clean up our `data` and `canvas` members
      ~Card();

      // Asset management
      void addImage(const std::string& name, const std::string& filename);
      void addFont(const std::string& name, const std::string& filename);
      void setCanvas(Canvas& c);

      // Renders a frame at the specified time
      void frame(int t);

      // This is set using the CardConfig from the constructor
      int duration = 0;

      // Basic public properties, self explanatory...
      int width = 0;
      int height = 0;

    private:
      // Holds our canvas, which is lazily loaded on our first
      // frame render.
      Canvas *canvas = nullptr;

      // Holds loaded images
      std::unordered_map<std::string, std::unique_ptr<Image>> imageCache;

      // Holds loaded fonts
      std::unordered_map<std::string, std::unique_ptr<Font>> fontCache;

      // Renders a frame
      std::function<void(int)> doFrame;

      // Holds an internal reference to our CardConfig so that we can
      // delete it later.  CardConfig itself uses a template, so it's
      // impossible to fully specify the type here without making Viz
      // do the same.  However, all the actual usage of data's typed
      // members happens in a place where we know the actual types
      // involved, so it's perfectly fine to leave this unspecified.
      void *data = nullptr;
  };

  // Need to implement our templated constructors here to make sure
  // they're generated correctly in compiled output.
  template <typename T>
  Card::Card(CardConfig<T> *(*creator)(const std::string&), const std::string& json)
  {
    auto config = creator(json);
    auto data = config->data;
    auto renderer = config->renderer;
    this->data = static_cast<void*>(data);
    this->duration = config->duration;
    delete config;

    this->doFrame = [this, renderer](int t)
    {
      // TODO - Special memory management
      RenderContext<T> rc(this->canvas, static_cast<T>(this->data));
      rc.update(t, this->duration);
      renderer(&rc);
    };
  }
  // see card.cpp for Card::Card(CardConfig<void> *(*creator)())
}

/*********************************
USAGE

// Initialize the card
Card c(cardCreator, "some json");
// Alternatively, if the card needs no data...
Card c(cardCreator);

// And do some rendering.  Note that, prior to making this call, you
// need to have a current OpenGL context.
for (int i=0; i<10000; i++)
  vcframe(i);

**********************************/

#endif
