import { BiochemicalProvider } from "@/contexts/biochemicalContext";
import "./globals.css";
import { DataProvider } from "@/contexts/dataContext";
import { UserProvider } from "@/contexts/userContext";
import { FoodProvider } from "@/contexts/foodContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Biolabs",
  description:
    "An organization founded on October 4th of 2024, designed to keeping humans healthy. Built on top of the most advanced, cutting-edge technologies and backed by the world's elite medical experts and healthcare professionals",
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
        {/* Basic favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        
        {/* PNG favicons for different sizes */}
        <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicon-180x180.png" sizes="180x180" />
        <link rel="icon" type="image/png" href="/favicon-192x192.png" sizes="192x192" />
        <link rel="icon" type="image/png" href="/favicon-256x256.png" sizes="256x256" />
        <link rel="icon" type="image/png" href="/favicon-512x512.png" sizes="512x512" />
        
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Microsoft Tile Color */}
        <meta name="msapplication-TileColor" content="#ffffff" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <BiochemicalProvider>
          <FoodProvider>
            <DataProvider>
              <UserProvider>
                <Header />
                {children}
                <Footer />
              </UserProvider>
            </DataProvider>
          </FoodProvider>
        </BiochemicalProvider>
      </body>
    </html>
  );
}