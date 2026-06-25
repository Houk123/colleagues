"use client";

import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
import { ColorModeProvider } from "@/shared/ui/color-mode";
import { Toaster } from "@/shared/ui/toaster";

const system = createSystem(defaultConfig, {
  globalCss: {
    body: {
      colorPalette: "blue",
    },
  },
  theme: {
    tokens: {
      fonts: {
        body: { value: "system-ui, sans-serif" },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: "0.125rem" },
        l2: { value: "0.25rem" },
        l3: { value: "0.375rem" },
      },
    },
  },
});

export const Provider = (props: PropsWithChildren) => (
  <ChakraProvider value={system}>
    <ColorModeProvider>
      {props.children}
      <Toaster />
    </ColorModeProvider>
  </ChakraProvider>
);
