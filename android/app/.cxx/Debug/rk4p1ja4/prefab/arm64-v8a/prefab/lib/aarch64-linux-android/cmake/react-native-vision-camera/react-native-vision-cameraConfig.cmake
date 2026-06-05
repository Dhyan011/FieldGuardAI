if(NOT TARGET react-native-vision-camera::VisionCamera)
add_library(react-native-vision-camera::VisionCamera SHARED IMPORTED)
set_target_properties(react-native-vision-camera::VisionCamera PROPERTIES
    IMPORTED_LOCATION "/Users/dhyanpatel/Downloads/FieldGuardAI/node_modules/react-native-vision-camera/android/build/intermediates/cxx/Debug/3n174v4m/obj/arm64-v8a/libVisionCamera.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/dhyanpatel/Downloads/FieldGuardAI/node_modules/react-native-vision-camera/android/build/headers/visioncamera"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

