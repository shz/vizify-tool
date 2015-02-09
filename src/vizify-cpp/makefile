# We put each object type into its own directory
SRC_DIR=src
OBJ_DIR=obj
OBJ_NATIVE_DIR=obj/native
OBJ_IOS_NATIVE_DIR=obj/ios/native
OBJ_IOS_SIM_DIR=obj/ios/sim
RELEASE_DIR=release

# Hunt down source files.  Dependencies must be pulled in by the file
# that needs them.
SOURCES := $(wildcard $(SRC_DIR)/*.cpp)

# One object file for each source file, ending up in the obj/* folder
OBJ := $(patsubst $(SRC_DIR)/%,%,$(SOURCES))
OBJ := $(patsubst %.cpp,%.o,$(OBJ))
OBJ := $(addprefix OUTPUT/,$(OBJ))
OBJ_NATIVE := $(patsubst OUTPUT/%,$(OBJ_NATIVE_DIR)/%,$(OBJ))
OBJ_IOS_NATIVE := $(patsubst OUTPUT/%,$(OBJ_IOS_NATIVE_DIR)/%,$(OBJ))
OBJ_IOS_SIM := $(patsubst OUTPUT/%,$(OBJ_IOS_SIM_DIR)/%,$(OBJ))

# Compiler ID -- do we ever need to override?
# CXX=$(CXX)
# AR=$(AR)

# TODO - Remove the Wno-parens once Virgil's C++ output is better
CXXFLAGS := -std=c++11 -g -Wno-parentheses-equality
LIBFLAGS := $(CXXFLAGS) -c -fpic
ARFLAGS := rcs

# Build targets, mostly for DRY
LIB_IOS_NATIVE=release/libvizify-ios-native.a
LIB_IOS_SIM=release/libvizify-ios-sim.a
LIB_IOS=release/libvizify-ios.a
LIB_NATIVE=release/libvizify.a
SANDBOX=release/sandbox

# Setup

all: sandbox
clean:
	@rm -rf obj || true
	@rm -rf release || true

# Directory creation

$(RELEASE_DIR):
	@mkdir -p $@

$(OBJ_NATIVE_DIR):
	@mkdir -p $@

$(OBJ_IOS_NATIVE_DIR):
	@mkdir -p $@

$(OBJ_IOS_SIM_DIR):
	@mkdir -p $@

# Obj file creation, per platform

$(OBJ_NATIVE): | $(OBJ_NATIVE_DIR)
$(OBJ_IOS_NATIVE): | $(OBJ_IOS_NATIVE_DIR)
$(OBJ_IOS_SIM): | $(OBJ_IOS_SIM_DIR)

$(OBJ_NATIVE_DIR)/%.o : $(SRC_DIR)/%.cpp
	$(CXX) $(LIBFLAGS) $< -o $@

$(OBJ_IOS_NATIVE_DIR)/%.o : $(SRC_DIR)/%.cpp
	xcrun --sdk iphoneos clang++ -stdlib=libc++ -mios-version-min=5.0 -arch arm $(LIBFLAGS) $< -o $@

$(OBJ_IOS_SIM_DIR)/%.o : $(SRC_DIR)/%.cpp
	xcrun --sdk iphonesimulator clang++ -stdlib=libc++ -mios-simulator-version-min=5.0 -arch i386 $(LIBFLAGS) $< -o $@

# Lib builds

$(LIB_NATIVE): $(OBJ_NATIVE) | $(RELEASE_DIR)
	$(AR) $(ARFLAGS) $@ $(OBJ_NATIVE)

$(LIB_IOS_NATIVE): $(OBJ_IOS_NATIVE) | $(RELEASE_DIR)
	$(AR) $(ARFLAGS) $@ $(OBJ_IOS_NATIVE)

$(LIB_IOS_SIM): $(OBJ_IOS_SIM) | $(RELEASE_DIR)
	$(AR) $(ARFLAGS) $@ $(OBJ_IOS_SIM)

$(LIB_IOS): $(LIB_IOS_SIM) $(LIB_IOS_NATIVE) | $(RELEASE_DIR)
	lipo -create $(LIB_IOS_SIM) $(LIB_IOS_NATIVE) -output $(LIB_IOS)

# Sandbox executable, using native lib

$(SANDBOX): $(wildcard sandbox/*.cpp) $(LIB_NATIVE) | $(RELEASE_DIR)
	# TODO - Figure out equivalent framework flags for non-osx
	$(CXX) $(CXXFLAGS) \
		-ferror-limit=100 \
		-framework Cocoa \
		-framework OpenGL \
		-framework IOKit \
		-framework CoreVideo \
		-I sandbox/deps/glfw/include -L sandbox/deps/glfw/lib-osx -l glfw3 \
		-I include -L release -l vizify \
		$(wildcard sandbox/*.cpp) -o release/sandbox

# Friendly names
lib-ios-native: $(LIB_IOS_NATIVE)
lib-ios-sim: $(LIB_IOS_SIM)
lib-ios: $(LIB_IOS)
lib: $(LIB_NATIVE)
sandbox: $(SANDBOX)
