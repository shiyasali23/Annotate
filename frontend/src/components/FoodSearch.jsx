"use client";

import React, { useState, useRef } from "react";
import { FaHeartbeat } from "react-icons/fa";
import { FaBowlFood } from "react-icons/fa6";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";

const FoodSearch = ({
  nutrientsData,
  foodsData,
  handleSelectedItem,
}) => {
  const [query, setQuery] = useState("");
  const searchBoxRef = useRef(null);

  // Function to calculate relevance based on index of the query in the name
  const getRelevance = (name) =>
    name.toLowerCase().indexOf(query.toLowerCase());

  // Filter and sort foods based on query relevance
  const filteredFoods = query
    ? foodsData
        .filter((food) => food.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => getRelevance(a.name) - getRelevance(b.name))
    : [];

  // Filter and sort nutrients based on query relevance
  const filteredNutrients = query
    ? nutrientsData
        .filter((nutrient) =>
          nutrient.name.toLowerCase().includes(query.toLowerCase())
        )
        .sort((a, b) => getRelevance(a.name) - getRelevance(b.name))
    : [];

  const handleSelect = (item, isFood) => {
    handleSelectedItem(item.name, isFood);
    setQuery("");
  };

  return (
    <div className="w-full xl:w-1/2 mx-auto relative mb-10 px-2" ref={searchBoxRef}>
      <input
        type="text"
        placeholder="Search Foods Or Nutrients"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2  border shadow-sm"
      />

      {query && (
        <div className="absolute z-50 w-full  bg-white  border shadow-md">
          <Command className=" border-0 shadow-none w-full">
            <CommandList className="max-h-[300px] overflow-y-auto">
              {filteredFoods.length === 0 && filteredNutrients.length === 0 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : (
                <>
                  {filteredFoods.length > 0 && (
                    <CommandGroup heading="Foods">
                      {filteredFoods.map((food, index) => (
                        <CommandItem
                          key={`food-${index}`}
                          onSelect={() => handleSelect(food, true)}
                        >
                          <FaBowlFood className="text-green-500 mr-2" />
                          <span className="flex-1 truncate">
                            {food.name} -{" "}
                            <span className="text-xs">
                              ({food.subCategory})
                            </span>
                          </span>
                          <CommandShortcut className={"font-bold text-xs"}>
                            {food.category}
                          </CommandShortcut>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {filteredNutrients.length > 0 && (
                    <CommandGroup heading="Nutrients">
                      {filteredNutrients.map((nutrient, index) => (
                        <CommandItem
                          key={`nutrient-${index}`}
                          onSelect={() => handleSelect(nutrient, false)}
                        >
                          <FaHeartbeat className="text-red-500 mr-2" />
                          <span className="flex-1 truncate">
                            {nutrient.name} -{" "}
                            <span className="text-xs">
                              ({nutrient.category})
                            </span>
                          </span>
                          <CommandShortcut className={"font-bold text-xs"}>
                            Nutrient
                          </CommandShortcut>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};

export default FoodSearch;
