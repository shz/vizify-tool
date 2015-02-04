#include <iostream>
#include <string>
#include <fstream>
#include <streambuf>
#include <chrono>

#include <GLFW/glfw3.h>
#include <vizify.hpp>

#include "gwv/main.cpp"

using namespace std;
using namespace vizify;

int SIZE = 286;
double SCALE = 3.0f;

// See render.cpp
void render(vizify::Canvas& canvas);

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

  vizify::Card card(createVizifyCard, json);
  vizify::Canvas canvas(SIZE, SIZE, SCALE * dpi);
  canvas.loadFont("Liberation Sans", "sandbox/liberation-sans-regular.ttf");
  card.setCanvas(canvas);

  auto start = curMS();
  while (!glfwWindowShouldClose(window))
  {
    card.frame(((curMS() - start) % card.duration));
    glfwSwapBuffers(window);
    glfwPollEvents();
  }

  glfwTerminate();
  return 0;
}
