if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/dhyanpatel/.gradle/caches/transforms-4/6cd604b93b28e77f135c352f720cc772/transformed/hermes-android-0.74.1-debug/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/dhyanpatel/.gradle/caches/transforms-4/6cd604b93b28e77f135c352f720cc772/transformed/hermes-android-0.74.1-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

