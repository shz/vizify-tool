#include <iostream>
#include <string>
#include <fstream>
#include <streambuf>
#include <chrono>

#include <GLFW/glfw3.h>
#include <vizify.hpp>

// #include "viz/main.cpp"

using namespace std;
using namespace vizify;

int SIZE = 286;
double SCALE = 1.0f;

// See render.cpp
// void render(vizify::Canvas& canvas);

// see json-print.cpp
int jsonPrint();

int curMS()
{
  auto duration = std::chrono::system_clock::now().time_since_epoch();
  auto millis = std::chrono::duration_cast<std::chrono::milliseconds>(duration).count();
  return (int)millis;
}

int main(void)
{
  GLFWwindow *window;

  if (!glfwInit()) {
    cerr << "Failed to initialize GLFW" << endl;
    return -1;
  }

  // Create window
  glfwWindowHint(GLFW_SAMPLES, 8);
  glfwWindowHint(GLFW_RESIZABLE, GL_FALSE);
  window = glfwCreateWindow(SIZE * SCALE, SIZE * SCALE, "Vizify Sandbox", nullptr, nullptr);
  if (!window)
  {
    cerr << "Failed to create GLFW window" << endl;
    glfwTerminate();
    return -1;
  }
  glfwMakeContextCurrent(window);
  glfwSwapInterval(1);

  // Figure out DPI
  GLFWmonitor* monitor = glfwGetPrimaryMonitor();
  const GLFWvidmode* mode = glfwGetVideoMode(monitor);
  int fbWidth;
  int fbHeight;
  glfwGetFramebufferSize(window, &fbWidth, &fbHeight);
  double dpi = ((double)fbWidth) / (SCALE * SIZE);

  std::ifstream jsonFile("../great-white-virgil/frozendata/ge_nighttime.json");
  std::string json((std::istreambuf_iterator<char>(jsonFile)),
                 std::istreambuf_iterator<char>());

  // std::cout << json << endl;

  // vizify::Card card(main, json);

  vizify::Canvas canvas(SIZE, SIZE, SCALE * dpi);
  canvas.loadFont("Liberation Sans", "sandbox/liberation-sans-regular.ttf");
  // card.setCanvas(canvas);

  auto start = curMS();
  
  Color *redC = new Color(0.8f, 0, 0);
  Color *greenC = new Color(0, 0.8f, 0);
  Color *blueC = new Color(0,0,0.8);
  Color *yellowC = new Color(0.8, 0.8f, 0);
  Color *whiteStrong = new Color(1, 1, 1, 0.7);
  Color *whiteWeak = new Color(1, 1, 1, 0.1);

  double S = SIZE;

  GradientSpec *gradspecRadial = canvas.createRadialGradient(S/2, S/2, 0, S/3, whiteStrong, whiteWeak);
  GradientSpec *gradspecLinear = canvas.createLinearGradient(0, 0, S, S, redC, greenC);
  GradientSpec *gradspecStroke = canvas.createLinearGradient(0, 0, S, S, blueC, yellowC);

  while (!glfwWindowShouldClose(window))
  {
    {
      CanvasFrame frame(canvas);

      canvas.setFillGradient(gradspecLinear);
      canvas.fillRect(0,0,SIZE,SIZE);
      canvas.setFillGradient(gradspecRadial);
      canvas.fillRect(0,0,SIZE,SIZE);

      canvas.setStrokeGradient(gradspecStroke);
      canvas.setLineWidth(15);
      canvas.beginPath();
      canvas.moveTo(0,0);
      canvas.lineTo(SIZE,SIZE);
      canvas.closePath();
      canvas.stroke();
    }

    glfwSwapBuffers(window);
    glfwPollEvents();
  }

  glfwTerminate();
  return 0;
}
