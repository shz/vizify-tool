#include "../include/vizify/card.hpp"
#include "../include/vizify/image.hpp"

// TODO - These are all stubbed

namespace vizify
{
  // Other constructors defined in card.hpp due to templates
  Card::Card(CardConfig<void> *(*creator)())
  {
    // Get the card config, take what we need, and delete it while
    // we still know its type.
    auto config = creator();
    auto renderer = config->renderer;
    this->duration = config->duration;
    delete config;

    // Prep our renderer
    this->doFrame = [this, renderer](int t)
    {
      RenderContext<void> rc(this->canvas);
      rc.update(t, this->duration);
      renderer(&rc);
    };
  }

  Card::~Card()
  {
    // TODO - Kill data.  Ideally this is done in CardConfig because
    //        we know the type and can therefore call the constructor.
  }

  void Card::addImage(const std::string& name, const std::string& filename)
  {

  }

  void Card::addFont(const std::string& name, const std::string& filename)
  {

  }

  void Card::setCanvas(Canvas& c)
  {
    canvas = &c;
    width = c.width;
    height = c.height;
  }

  void Card::frame(int t)
  {
    CanvasFrame frame(*this->canvas);
    doFrame(t);
  }
}
