#include <iostream>
#include <GLFW/glfw3.h>
#include <vizify.hpp>

using namespace vizify;

CardConfig<void>*createTestCard();

using namespace std;

int main(void)
{
  GLFWwindow *window;

  if (!glfwInit()) {
    cerr << "Failed to initialize GLFW" << endl;
    return -1;
  }

  glfwWindowHint(GLFW_RESIZABLE, GL_FALSE);
  window = glfwCreateWindow(512, 512, "Vizify Sandbox", nullptr, nullptr);
  if (!window)
  {
    cerr << "Failed to create GLFW window" << endl;
    glfwTerminate();
    return -1;
  }
  glfwMakeContextCurrent(window);

//  Card card(createTestCard, "{\"foo\": \"bar\"}");
    Card card(createTestCard);

  while (!glfwWindowShouldClose(window))
  {
    card.frame(0);
    glfwSwapBuffers(window);
    glfwPollEvents();
  }

  glfwTerminate();
  return 0;
}
