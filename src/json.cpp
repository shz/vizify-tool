#include "../include/vizify/json.hpp"
#include "../deps/gason/gason.h"
#include "../deps/gason/gason.cpp"

#include <cstdlib>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <stdexcept>

using namespace std;

namespace vizify
{
  JSON::JSON() : children(nullptr), arrayValue(nullptr)
  {
  }

  void JSON::addChild(std::string key, JSON* value)
  {
    if (children == nullptr) {
      children = new std::unordered_map<std::string, JSON*>;
    }
    (*children)[key] = value;
  }

  void JSON::addArrayItem(JSON* value)
  {
    if (arrayValue == nullptr) {
      arrayValue = new std::vector<JSON*>;
    }
    arrayValue->push_back(value);
  }

  void JSON::set(std::string value)
  {
    stringValue = value;
  }

  void JSON::set(int value)
  {
    char buffer [50];
    sprintf(buffer, "%d", value);
    stringValue = buffer;
  }

  void JSON::set(double value)
  {
    char buffer [50];
    sprintf(buffer, "%f", value);
    stringValue = buffer;
  }

  bool JSON::isNull()
  {
    return stringValue == "null";
  }

  std::string JSON::asStr()
  {
    return stringValue;
  }

  int JSON::asInt()
  {
    return std::stoi(stringValue, nullptr);
  }

  double JSON::asFloat()
  {
    return std::stod(stringValue, nullptr);
  }

  std::vector<JSON*>* JSON::asList()
  {
    return arrayValue;
  }

  JSON* JSON::get(std::string key)
  {
    if (children != nullptr) {
      return (*children)[key];
    }
    return nullptr;
  }

  // Copy the parsed json tree into a tree of JSON objects.
  JSON* copyJsonTree(JsonValue o)
  {
    JSON *root = new JSON();

    switch (o.getTag()) {

    case JSON_TAG_NUMBER:
       root->set(o.toNumber());
       break;

    case JSON_TAG_BOOL:
       root->set(o.toBool() ? "true" : "false");
       break;

    case JSON_TAG_STRING:
      root->set(o.toString());
      break;

    case JSON_TAG_NULL:
      root->set("null");
      break;

    case JSON_TAG_ARRAY:
      if (!o.toNode()) {
        return nullptr;
      }

      for (auto i : o) {
        root->addArrayItem(copyJsonTree(i->value));
      }
      break;

    case JSON_TAG_OBJECT:
      if (!o.toNode()) {
        return nullptr;
      }

      for (auto i : o) {
        root->addChild(i->key, copyJsonTree(i->value));
      }
      break;
    }
    return root;
  }

  JSON* parseJSON(std::string json)
  {
    size_t len = json.length();
    char *data = new char[len + 1];  // TODO: memory leak

    // copy data and null terminate - Important because gason is a destructive
    json.copy(data, len);
    data[len]='\0';

    char *endptr;
    JsonValue value;
    JsonAllocator allocator;

    JsonParseStatus status = jsonParse(data, &endptr, &value, allocator);
    if (status != JSON_PARSE_OK) {
      delete[] data;
      return nullptr;
    }
    return copyJsonTree(value);
  }
}
