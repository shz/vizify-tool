#include <vizify/canvas.hpp>
#include <vizify/card.hpp>
#include <iostream>


using namespace vizify;
using namespace std;

void renderer(RenderContext<void>* ctx)
{
  cout << "renderer!" << endl;
}

CardConfig<void>* cardCreator()
{
  return new CardConfig<void>(1000, renderer);
}

void renderCard(Canvas& canvas)
{
  Card card(cardCreator);
  card.frame(0);
}

void drawShapes(Canvas& canvas)
{
//  canvas.setGlobalAlpha(0.7f);

  canvas.setFillStyle(0, 0, 255.0f);
  canvas.fillRect(20, 20, 100, 100);

  canvas.clearRect(40, 40, 60, 60);

  canvas.setStrokeStyle(255.0f, 255.0f, 255.0f);
  canvas.setLineWidth(3.0f);
  canvas.strokeRect(50, 50, 40, 40);

  canvas.setFillStyle(255.0f, 255.0f, 255.0f);
  canvas.fontFamily = "Cambria";
  canvas.fontSize = 30;
  canvas.fillText("Hello world", 200.0f, 300.0f);

  canvas.beginPath();
  canvas.translate(0, 20.0f);
  canvas.setLineWidth(5.0f);
  canvas.moveTo(180, 300);
  canvas.lineTo(400, 300);
  canvas.lineTo(200, 200);
  canvas.lineTo(180, 300);
  canvas.stroke();;

  canvas.beginPath();
  canvas.setFillStyle(200, 200, 40);
  canvas.ellipse(200, 60, 50, 50);
  canvas.fill();

  canvas.beginPath();
  canvas.arc(420, 420, 20, 0, 3, true);
  canvas.fill();

  canvas.beginPath();
  canvas.setStrokeStyle(0, 255.0f, 255.0f);
  canvas.setLineWidth(3);
  canvas.moveTo(0, 300);
  canvas.arcTo(300, 100, 400, 200, 100);
  canvas.stroke();

  canvas.beginPath();
  canvas.setStrokeStyle(0, 255.0f, 0);
  canvas.setLineWidth(2);
  canvas.moveTo(500, 100);
  canvas.bezierCurveTo(300, 120, 400, 200, 100, 100);
  canvas.stroke();

  canvas.beginPath();
  canvas.setStrokeStyle(255.0f, 0, 0);
  canvas.setLineWidth(8);
  canvas.moveTo(0, 350);
  canvas.quadraticCurveTo(300, 120, 400, 200);
  canvas.stroke();
}

void drawClippedShapes(Canvas& canvas)
{
  canvas.startClip(100, 100, 100, 100);
  canvas.setFillStyle(0, 0, 255.0f);
  canvas.fillRect(20, 20, 400, 400);

  canvas.endClip();
  canvas.setFillStyle(0, 255.0f, 0);
  canvas.fillRect(150, 150, 200, 200);
}

void drawImages(Canvas& canvas)
{
  // TODO: memory leaks
  Image *tony = new Image(canvas.vg, "sandbox/tony_stark.jpg");
  Image *bro = new Image(canvas.vg, "sandbox/come_at_me_bro.png");

  // canvas.drawImage(tony, 0, 0, 0, 0, 0, 0, 0, 0);
  // canvas.drawImage(bro, 0, 0, 0, 0, 300, 0, 0, 0);
}

void drawRects(Canvas& canvas)
{
  canvas.beginPath();
  canvas.setStrokeStyle(0, 255.0f, 0);
  canvas.setLineWidth(4);
  canvas.rect(50, 50, 100, 100);
  canvas.stroke();
}

void render(Canvas& canvas)
{
  //  renderCard(canvas);

  CanvasFrame frame(canvas);
 drawRects(canvas);
  drawImages(canvas);
 drawShapes(canvas);
 drawClippedShapes(canvas);
}
