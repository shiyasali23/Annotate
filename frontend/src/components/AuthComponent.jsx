import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader } from "lucide-react";
import { useData } from "@/contexts/dataContext";
import { useUser } from "@/contexts/userContext";

import { authenticate } from "@/lib/auth-api";

const AuthComponent = () => {
  const { authApiOPtions } = useData();
  const { handleAuthResponse } = useUser();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [inputFields, setInputFields] = useState({
    password: "securepassword123",
    email: "jhnoe@example.com",
    first_name: "",
    last_name: "",
    gender: "",
  });

  const handleFieldChange = (field, value) =>
    setInputFields((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const isMissing = isSignUp
      ? Object.values(inputFields).some((v) => !v.trim())
      : !inputFields.email.trim() || !inputFields.password.trim();

    if (isMissing) {
      setMessage(
        isSignUp ? "All fields are required" : "Email and password are required"
      );
      return;
    }

    await handleAuthenticate(inputFields, authApiOPtions[isSignUp ? 1 : 0]);
  };

  const handleAuthenticate = async (fields, apiOption) => {
    setLoading(true);
    const { data, message: authMessage } = await authenticate(fields, apiOption);
  
    if (authMessage) {
      setMessage(authMessage);
    } else if (data) {
      handleAuthResponse(data)
      
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md border mt-16 rounded-none shadow-xl border-gray-100">
      <CardHeader className="space-y-1 px-4 py-3">
        <CardTitle className="text-xl md:text-2xl text-center font-bold text-gray-900">
          {isSignUp ? "Create Account" : "Sign In"}
        </CardTitle>
        {message && (
          <p className="text-md font-semibold text-red-500 text-center">
            {message}
          </p>
        )}
      </CardHeader>
      <CardContent className="grid gap-2 px-4 py-3">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="first_name" className="text-sm">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  type="text"
                  className="rounded-none h-9 bg-white border-gray-300 focus:ring-gray-500 text-sm"
                  onChange={(e) =>
                    handleFieldChange("first_name", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="last_name" className="text-sm">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  type="text"
                  className="rounded-none h-9 bg-white border-gray-300 focus:ring-gray-500 text-sm"
                  onChange={(e) =>
                    handleFieldChange("last_name", e.target.value)
                  }
                />
              </div>
            </div>
          )}
          <div className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={inputFields.email}
                className="rounded-none h-9 bg-white border-gray-300 focus:ring-gray-500 text-sm"
                onChange={(e) => handleFieldChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={inputFields.password}
                className="rounded-none h-9 bg-white border-gray-300 focus:ring-gray-500 text-sm"
                onChange={(e) => handleFieldChange("password", e.target.value)}
              />
            </div>
          </div>
          {isSignUp && (
            <div>
              <Label htmlFor="gender" className="text-sm">
                Gender
              </Label>
              <Select
                onValueChange={(value) => handleFieldChange("gender", value)}
              >
                <SelectTrigger
                  id="gender"
                  className="h-9 rounded-none bg-white border-gray-300 focus:ring-gray-500 text-sm"
                >
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            type="submit"
            className="w-1/2 mx-auto rounded-none h-9 bg-gray-900 hover:bg-gray-800 text-sm font-medium"
            disabled={loading}
          >
            {loading ? (
              <Loader className="animate-spin" />
            ) : isSignUp ? (
              "Sign Up"
            ) : (
              "Log In"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center px-4 py-3">
        <p className="text-xs md:text-sm text-gray-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <Button
            variant="link"
            className="text-xs font-semibold ml-2 md:text-sm text-gray-900 hover px-1 underline h-auto p-0"
            onClick={() => {
              setIsSignUp((prev) => !prev);
              setMessage("");
            }}
            disabled={loading}
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default AuthComponent;
