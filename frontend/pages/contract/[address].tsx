import CreateTransactionModal from "../../components/CreateTransactionModal";
import Navbar from "../../components/Navbar";
import TransactionTableRow from "../../components/TransactionTableRow";
import {
  Box,
  Button,
  Flex,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useContract, useContractEvents, useContractRead} from "@thirdweb-dev/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { createRef, useState } from "react";
import copy from 'clipboard-copy';
import { FiCopy } from 'react-icons/fi';
import { ethers } from "ethers";

const ContractPage = () => {

    const router = useRouter();
    const { address } = router.query;
    const { isOpen, onClose, onOpen } = useDisclosure();
    const { contract, isLoading: isContractLoading, error: contractError} = useContract(address as string, "custom");
    const { data: owners, isLoading: isOwnersLoading, error: ownersError} = useContractRead(contract, "getOwners");

    const {
      data: requiredSignatures,
      isLoading: isSignaturesLoading,
      error: signaturesError,
    } = useContractRead(contract, "getRequiredSignatures");

    const { data: transactions, isLoading: isTransactionsLoading } =
      useContractEvents(contract, "TransactionCreated", {
        queryFilter: {
          order: "desc",
        },
        subscribe: true,
      });

      // handle copy wallet address
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

  //handle get balance of multisig wallet
  const [balance, setBalance] = useState('0')
  // connect mumbai testnet
  const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');
  // get wallet address 
  const walletAddress:any = address;
  // get balance
  provider.getBalance(walletAddress).then((balance) => {
    const balanceEth = ethers.utils.formatEther(balance);
    console.log('Số dư:', balanceEth);
    setBalance(balanceEth)
  }).catch((error) => {
    console.warn('Lỗi khi lấy số dư:', error);
  });


  return (
    <>
    <Head>
      <title>Contract - multi-sig wallet</title>
    </Head>

    <CreateTransactionModal contractAddress={address as string} onClose={onClose} isOpen={isOpen}/>

    <Navbar />

    <Box mt={10} maxW="6xl" w="full" mx="auto">

      <Stat border="1px" rounded="xl" p="7" borderColor="gray.400">
        <Flex alignItems="center" justifyContent="space-between">
            <Box>
                <StatLabel fontWeight={700}>Wallet Address:</StatLabel>
                <StatNumber color="#0482f7" ref={walletRef}>
                    {address}
                    <Button onClick={handleCopy} ml={3} size="10"><FiCopy /></Button>
                </StatNumber>
            </Box>
            <StatLabel fontWeight={600} fontSize={18}>Balance: {balance} ETH </StatLabel>
        </Flex>
      </Stat>
    </Box>

    <Flex mt={5} gap={5} maxW="6xl" w="full" mx="auto">
        <Stat border="1px" rounded="xl" p="7" borderColor="gray.400">
            <StatLabel fontWeight={700}>Number of owners</StatLabel>
            <StatNumber color="#0482f7">
              {isOwnersLoading ? <Skeleton>10</Skeleton> : owners?.length}
            </StatNumber>
        </Stat>
      <Stat border="1px" rounded="xl" p="7" borderColor="gray.400">
          <StatLabel fontWeight={700}>Signatures required</StatLabel>
          <StatNumber color="#0482f7">
            {isSignaturesLoading ? (
              <Skeleton>10</Skeleton>
            ) : (
              requiredSignatures?.toString()
            )}
          </StatNumber>
      </Stat>
    </Flex>

    <Flex
        mt="7"
        maxW="6xl"
        mx="auto"
        w="full"
        justifyContent="space-between"
        alignItems="center"
    >
        <Text fontWeight="bold" fontSize="3xl">
          Transactions
        </Text>
        <Button onClick={onOpen} colorScheme="twitter">
          Create Transaction
        </Button>
    </Flex>

    <Table mt="7" maxW="6xl" mx="auto" w="full">
      <Thead>
        <Tr>
          <Th>ID</Th>
          <Th>Destination</Th>
          <Th>Value</Th>
          <Th>Data</Th>
          <Th>Signatures</Th>
          <Th>Status</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {transactions?.map((transaction) => (
          <TransactionTableRow
            contractAddress={address as string}
            id={transaction.data.transactionId}
            key={transaction.data.transactionId}
          />
        ))}
      </Tbody>
    </Table>
  </>
  )
}

export default ContractPage;