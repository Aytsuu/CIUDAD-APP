import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { Controller } from "react-hook-form";
import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "@/lib/utils";
import { Drawer } from "../drawer-deprecated";

type Option = { label: string; value: string };

const FormComboCheckbox = ({
  control,
  name,
  label,
  options,
  readOnly,
  placeholder = "Select options",
}: {
  control: any;
  name: string;
  label?: string;
  options: Option[];
  readOnly?: boolean;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isAll, setIsAll] = useState(false);
  const [isRemoveAll, setIsRemoveAll] = useState(false);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selectedValues = Array.isArray(value)
          ? value
          : value
          ? [value]
          : [];

        useEffect(() => {
          if (isAll) onChange(options.map((opt) => opt.value));
        }, [isAll]);

        useEffect(() => {
          if (isRemoveAll) {
            onChange([])
            setIsRemoveAll(false);
          }
        }, [isRemoveAll]);

        useEffect(() => {
          if (!options.every(opt => selectedValues.includes(opt.value) == true)) setIsAll(false);
          else setIsAll(true);
        }, [selectedValues, options]);

        const toggleOption = (optionId: string) => {
          const newValues = selectedValues.includes(optionId)
            ? selectedValues.filter((val: string) => val !== optionId)
            : [...selectedValues, optionId];
          onChange(newValues);
        };

        const selectedOptions = options.filter(
          (option) => selectedValues.includes(option.value) == true
        );

        const getDisplayText = () => {
          if (selectedOptions.length === 0) return placeholder;
          return selectedOptions.map((opt) => opt.label).join(", ");
        };

        return (
          <View className="w-full">
            {label && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm">{label}</Text>
                <TouchableOpacity
                  className="flex-row gap-1 items-center"
                  onPress={() => setIsOpen(true)}
                >
                  <Text className="text-primaryBlue text-sm">Select</Text>
                </TouchableOpacity>
              </View>
            )}
            {!readOnly ? (
              <View className="">
                {selectedOptions?.length == 0 && (
                  <View className="flex-row items-center justify-center h-20">
                    <Text className="text-gray-500">No selected position</Text>
                  </View>
                )}

                <View className="flex-1 flex-row flex-wrap py-2 gap-2">
                  {selectedOptions?.map((option) => (
                    <View className="relative bg-blue-100 px-3 py-1 rounded-full">
                      <Text className="text-xs font-medium">
                        {option.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text className="border border-gray-300 rounded-md px-3 py-2">
                {getDisplayText()}
              </Text>
            )}
            {error && (
              <Text className="text-red-500 text-sm mt-1">{error.message}</Text>
            )}

            <Drawer
              header="Positions"
              description="Select positions"
              visible={isOpen}
              onClose={() => setIsOpen(false)}
            >
              <View className="px-6 pb-6">
                <TextInput
                  placeholder="Search"
                  value={search}
                  onChangeText={setSearch}
                  className="border border-gray-300 rounded-md px-3 py-2 mb-4"
                />
                <TouchableOpacity onPress={() => onChange([])}>
                  <Text className="text-right text-sm text-gray-700">
                    Clear
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if(isAll) setIsRemoveAll(true);
                    setIsAll((prev) => !prev)
                  }}
                  className="flex-row items-center py-2"
                >
                  <View
                    className={cn(
                      "w-5 h-5 border border-gray-400 rounded mr-2",
                      isAll && "bg-blue-500 border-blue-500"
                    )}
                  >
                    {isAll && (
                      <MaterialIcons
                        name="check"
                        size={14}
                        color="white"
                        className="m-auto"
                      />
                    )}
                  </View>
                  <Text className="text-sm">ALL</Text>
                </TouchableOpacity>
                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => toggleOption(item.value)}
                      className="flex-row items-center py-2"
                    >
                      <View
                        className={cn(
                          "w-5 h-5 border border-gray-400 rounded mr-2",
                          selectedValues.includes(item.value) &&
                            "bg-blue-500 border-blue-500"
                        )}
                      >
                        {selectedValues.includes(item.value) && (
                          <MaterialIcons
                            name="check"
                            size={14}
                            color="white"
                            className="m-auto"
                          />
                        )}
                      </View>
                      <Text className="text-sm">{item.label}</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={() => (
                    <Text className="text-center text-gray-500">
                      No options found
                    </Text>
                  )}
                />
              </View>
            </Drawer>
          </View>
        );
      }}
    />
  );
};

export default FormComboCheckbox;
