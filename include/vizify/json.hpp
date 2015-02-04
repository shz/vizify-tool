#ifndef VIZIFY_JSON_H
#define VIZIFY_JSON_H

#include <string>
#include <vector>
#include <unordered_map>


#include "../../deps/gason/gason.h"

namespace vizify
{
    class JSON
    {
      public:
        JSON();

        void addChild(std::string key, JSON* value);
        void addArrayItem(JSON* value);
        void set(std::string value);
        void set(int value);
        void set(double value);

        JSON* get(std::string key);

        bool isNull();
        std::string asStr();
        int asInt();
        double asFloat();
        bool asBool();
        std::vector<JSON*>* asList();

      private:
        std::string stringValue;
        std::unordered_map<std::string, JSON*> *children;
        std::vector<JSON*>* arrayValue;
    };

    JSON* parseJSON(std::string json);
}

#endif
