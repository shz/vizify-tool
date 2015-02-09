#include <iostream>
#include <string>
#include <fstream>
#include <streambuf>
#include <chrono>

#include <GLFW/glfw3.h>
#include <vizify.hpp>

#include "../main.cpp"

using namespace std;
using namespace vizify;

const int WIDTH = 300; // TODO - Fill in
const int HEIGHT = 300; // TODO - Fill in

int curMS()
{
  auto duration = std::chrono::system_clock::now().time_since_epoch();
  auto millis = std::chrono::duration_cast<std::chrono::milliseconds>(duration).count();
  return (int)millis;
}

int main(int argc, char** argv)
{
  GLFWwindow *window;

  // Create window
  if (!glfwInit())
  {
    cerr << "Failed to initialize GLFW" << endl;
    return 1;
  }
  glfwWindowHint(GLFW_SAMPLES, 8);
  glfwWindowHint(GLFW_RESIZABLE, GL_FALSE);
  window = glfwCreateWindow(WIDTH, HEIGHT, "Vizify Demo", nullptr, nullptr);
  if (!window)
  {
    cerr << "Failed to create GLFW window" << endl;
    glfwTerminate();
    return 1;
  }
  glfwMakeContextCurrent(window);
  glfwSwapInterval(1);

  // Figure out DPI
  GLFWmonitor* monitor = glfwGetPrimaryMonitor();
  const GLFWvidmode* mode = glfwGetVideoMode(monitor);
  int fbWidth;
  int fbHeight;
  glfwGetFramebufferSize(window, &fbWidth, &fbHeight);
  double dpi = ((double)fbWidth / WIDTH);

  // Load data
  string data = "";
  if (argc >= 2)
  {
    ifstream dataStream(argv[1]);
    stringstream buf;
    buf << dataStream.rdbuf();
    data = buf.str();
  }
  cout << data << endl;

  // Set up the Vizify card
  vizify::Card card(demoViz::main, data);
  vizify::Canvas canvas(WIDTH, HEIGHT, dpi);
  card.setCanvas(canvas);

  // Render loop
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
