import "./globals.css";
import { DataProvider } from "@/contexts/dataContexts";
import { UserProvider } from "@/contexts/userContext";



export const metadata = {
  title: 'Biolabs',
  description: 'Your app description',
  viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
  appleWebApp: {
    capable: 'yes',
    statusBarStyle: 'black-translucent'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <DataProvider>
          <UserProvider>
        {children}
        </UserProvider>
        </DataProvider>
      </body>
    </html>
  );
}
