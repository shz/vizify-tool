RELEASE_DIR=../release/examples
CXXFLAGS := -g -std=c++11 -I ../include -L ../release -l vizify

all: json

$(RELEASE_DIR):
	@mkdir -p $@

$(RELEASE_DIR)/json: json/main.cpp | $(RELEASE_DIR)
	$(CXX) $(CXXFLAGS) json/main.cpp -o $@

clean:
	@rm -rf $(RELEASE_DIR)

json: $(RELEASE_DIR)/json
