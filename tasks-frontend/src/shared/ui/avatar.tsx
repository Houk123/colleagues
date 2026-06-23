import { Avatar as ChakraAvatar } from "@chakra-ui/react"
import * as React from "react"

export interface AvatarProps extends ChakraAvatar.RootProps {
  name?: string
  src?: string
  fallback?: React.ReactNode
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar(props, ref) {
    const { name, src, fallback, children, ...rest } = props
    return (
      <ChakraAvatar.Root ref={ref} {...rest}>
        <ChakraAvatar.Fallback name={name}>{fallback}</ChakraAvatar.Fallback>
        <ChakraAvatar.Image src={src} alt={name} />
        {children}
      </ChakraAvatar.Root>
    )
  },
)
