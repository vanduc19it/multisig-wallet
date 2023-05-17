import { Link } from '@chakra-ui/next-js'
import { Box, Flex, Text } from '@chakra-ui/react'
import { ConnectWallet } from '@thirdweb-dev/react'
import React from 'react'

const Navbar = () => {
  return (
    <Box w="full" borderBottomWidth={1}>
      <Flex
        w="full"
        maxW="6xl"
        mx="auto"
        justifyContent="space-between"
        alignItems="center"
        py="3"
      >
        <Flex gap="7" alignItems="center">
          <Text fontWeight="bold" fontSize="2xl">
            Multisig-wallet
          </Text>
          <Flex gap="5" alignItems="center">
            <Link href="/" fontWeight="medium" fontSize="lg">
              Home
            </Link>
          </Flex>
        </Flex>
        <ConnectWallet theme="light" />
      </Flex>
    </Box>
  )
}

export default Navbar