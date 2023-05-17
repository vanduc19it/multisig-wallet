import { useRouter } from 'next/router';
import React, { createRef, useRef } from 'react'
import { Button, Td, Tr, useToast } from "@chakra-ui/react";
import copy from 'clipboard-copy';
import { FiCopy } from 'react-icons/fi';
type Props = {
    contractAddress: string;
  };

const ContractTableRow = ({ contractAddress }: Props) => {

    const router = useRouter();

    const toast = useToast();
    const walletRef = createRef<HTMLSpanElement>();
    const handleCopy = () => {
      const walletAddress:any = walletRef.current?.textContent;
      copy(walletAddress);
      toast({
        title: 'Copied address',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    };
    
  return (
    <Tr>
    <Td fontWeight={600} color="#7a7a7a">
        <span ref={walletRef}>{contractAddress}</span>
        <Button onClick={handleCopy} ml={3} size="10"><FiCopy /></Button>
    </Td>
    <Td>
      <Button
        colorScheme="twitter"
        onClick={() => router.push(`/contract/${contractAddress}`)}
      >
        Manage
      </Button>
    </Td>
  </Tr>
  )
}

export default ContractTableRow