#include <iostream>
#include <vizify.hpp>

using namespace std;

int main()
{
  // Read JSON from stdin
  // cin >> noskipws;
  // istream_iterator<char> it(std::cin);
  // istream_iterator<char> end;
  // string json(it, end);

  string s = "{\"foo\": \"bar\", \"baz\": 123}";
  vizify::JSON *json = vizify::parseJSON(s);

  cout << "foo: " << json->get("foo")->asStr() << endl;
  cout << "baz: " << json->get("baz")->asInt() << endl;
  if (json->get("missing") == nullptr)
    cout << "missing: null" << endl;

  return 0;
}
