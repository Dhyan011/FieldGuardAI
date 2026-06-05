if(NOT TARGET shopify_react-native-skia::rnskia)
add_library(shopify_react-native-skia::rnskia SHARED IMPORTED)
set_target_properties(shopify_react-native-skia::rnskia PROPERTIES
    IMPORTED_LOCATION "/Users/dhyanpatel/Downloads/FieldGuardAI/node_modules/@shopify/react-native-skia/android/build/intermediates/cxx/Debug/2pv2b6x4/obj/arm64-v8a/librnskia.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/dhyanpatel/Downloads/FieldGuardAI/node_modules/@shopify/react-native-skia/android/build/headers/rnskia"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

