import { BiochemicalProvider } from "@/contexts/biochemicalContext";
import "./globals.css";
import { DataProvider } from "@/contexts/dataContext";
import { UserProvider } from "@/contexts/userContext";
import { FoodProvider } from "@/contexts/foodContext";

export const metadata = {
  title: "Biolabs",
  description: "Your app description",
  appleWebApp: {
    capable: "yes",
    statusBarStyle: "black-translucent",
  },
};

// New separate viewport export
export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <BiochemicalProvider>
          <FoodProvider>
            <DataProvider>
              <UserProvider>{children}</UserProvider>
            </DataProvider>
          </FoodProvider>
        </BiochemicalProvider>
      </body>
    </html>
  );
}
