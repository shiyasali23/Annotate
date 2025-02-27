import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import CustomButton from "./CustomButton";
import { Loader } from "lucide-react";

import { useUser } from "@/contexts/userContext";
import { updateUser } from "@/lib/user-api";

const UserDataComponent = () => {
  const { userData, userDataLoading, setUserDataLoading, handleUserdata } = useUser();
  const userDataArray = [
    ["First Name", "first_name", "text", "string"],
    ["Last Name", "last_name", "text", "string"],
    ["Email", "email", "email", "email"],
    ["Date of Birth", "date_of_birth", "date", "date"],
    ["Weight Kg", "weight_kg", "number", "float"],
    ["Height Cm", "height_cm", "number", "float"],
    ["Gender", "gender", ["male", "female"], "string"],
  ];
  const requiredFields = ["first_name", "last_name", "email", "gender"];

  const [inputValues, setInputValues] = useState({});
  const [isChanged, setIsChanged] = useState(false);
  const [message, setMessage] = useState();

  // Convert value to correct backend type
  const formatValue = (value, dataType) => {
    if (!value && value !== 0) return null;

    switch (dataType) {
      case "float":
        return parseFloat(value) || null;
      case "int":
        return parseInt(value, 10) || null;
      case "date":
        return value || null;
      case "email":
        return value.trim() || null;
      case "string":
        return value.toString().trim() || null;
      default:
        return value;
    }
  };

  const handleValueChange = (value, key) => {
    setMessage(undefined);
    const field = userDataArray.find((item) => item[1] === key);
    const fieldType = field?.[2];
    const dataType = field?.[3];
    const newInputValues = { ...inputValues };

    // Validation
    if (requiredFields.includes(key) && (!value || value === "")) {
      setMessage(`${key.replace("_", " ")} cannot be blank`);
      delete newInputValues[key];
    } else {
      message?.includes(key.replace("_", " ")) && setMessage(undefined);
      const normalizedValue = fieldType === "number" ? Number(value) : value;
      const normalizedOriginal =
        fieldType === "number" ? Number(userData[key]) : userData[key];

      if (normalizedValue === normalizedOriginal) {
        delete newInputValues[key];
      } else {
        newInputValues[key] = formatValue(value, dataType);
      }
    }

    setInputValues(newInputValues);
    setIsChanged(Object.keys(newInputValues).length > 0);
  };

  const handleUserDataSave = async () => {
    if (!isChanged) return;
    setUserDataLoading(true);

    try {
      const newUserData = await updateUser(inputValues);
      console.log("newUserData", newUserData);
      
      if (newUserData) {
        handleUserdata(newUserData);
        setMessage("User data updated successfully");
      }
    } catch (error) {
      setMessage(error.message || "Error updating user data");
    } finally {
      setUserDataLoading(false);
    }
  };

  return (
    <div className="w-full h-full mt-5 xl:px-10 px-3 flex flex-col gap-10">
      <h1 className="xl:text-3xl text-lg font-bold underline underline-offset-8 w-full text-center xl:text-left">
        User Information
      </h1>
      {message && (
        <p
          className={`w-full text-center text-md ${
            message.includes("successfully") ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {userDataArray.map(([label, key, type]) => (
          <div
            key={key}
            className="w-[230px] xl:w-[300px] h-[50px] flex items-center justify-between xl:justify-start xl:gap-4"
          >
            <Label className="text-xs xl:text-sm">{label}:</Label>
            {Array.isArray(type) ? (
              <Select
                defaultValue={userData[key] || ""}
                onValueChange={(value) => handleValueChange(value, key)}
              >
                <SelectTrigger className="w-[150px] xl:w-[180px] text-xs xl:text-sm">
                  <SelectValue placeholder={userData[key] || "Select"} />
                </SelectTrigger>
                <SelectContent>
                  {type.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={type}
                className="text-xs xl:text-sm w-[150px] xl:w-[180px]"
                value={
                  inputValues[key] !== undefined
                    ? inputValues[key] || ""
                    : userData[key] || ""
                }
                onChange={(e) => handleValueChange(e.target.value, key)}
              />
            )}
          </div>
        ))}
        {isChanged && (
          <CustomButton
            text={
              userDataLoading ? <Loader className="animate-spin" /> : "Save"
            }
            className="w-1/2 xl:w-full m-auto"
            onClick={handleUserDataSave}
          />
        )}
      </div>
    </div>
  );
};

export default UserDataComponent;
