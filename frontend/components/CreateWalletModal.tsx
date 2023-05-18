import { FACTORY_ADDRESS, IMPLEMENTATION_ADDRESS } from "../address/contractAddress";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  TransactionResult,
  useAddress,
  useContract,
  useContractEvents,
  useContractWrite,
} from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

type CreateWalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
};
const CreateWalletModal = ({ isOpen, onClose }: CreateWalletModalProps) => {


  const router = useRouter();
  const address = useAddress(); //get address metamask wallet
  
  const { contract: factoryContract, isLoading: isFactoryContractLoading } = useContract(FACTORY_ADDRESS, "custom");
  const { contract: implementationContract } = useContract( IMPLEMENTATION_ADDRESS, "custom");

  const { mutateAsync: deploy, isLoading: isDeploying } = useContractWrite( factoryContract, "deployContract");
  const { data: events, refetch: refetchEvents } = useContractEvents(
    factoryContract,
    "ContractDeployed",
    {
      queryFilter: {
        filters: {
          _deployer: address,
        },
        order: "desc",
      },
    }
  );

    useEffect(() => {
        events?.forEach((event) => {
          if (event.transaction.transactionHash === txHash) {
            // Close modal and redirect to contract page
            closeModal();
            router.push(`/contract/${event.data._contractAddress}`);
          }
        });
      }, [events]);
    
      console.log(events);
    
      const [owners, setOwners] = useState<string[]>([""]);
      const [noOfSignaturesRequired, setNoOfSignaturesRequired] =
        useState<number>(0);
      const [txHash, setTxHash] = useState<string>("");
    
      const toast = useToast();


    //handle create new multisig wallet
    const deployNow = async () => {
        try {
          // encode transaction
          const encodedData = implementationContract?.encoder.encode("initialize", [
            owners,
            noOfSignaturesRequired,
          ]);
    
          const tx: TransactionResult = await deploy({
            args: [encodedData],
          });
    
          setTxHash(tx.receipt.transactionHash);
          await refetchEvents();
    
          toast({
            status: "success",
            title: "Wallet deployed",
            description: "Your multi-sig wallet has been deployed.",
          });
          closeModal();
        } catch (err) {
          console.error(err);
          toast({
            status: "error",
            title: "Error deploying wallet",
            description: "Please try again later.",
          });
        }
      };

    const closeModal = () => {
        setNoOfSignaturesRequired(0);
        setOwners([""]);
        setTxHash("");
        onClose();
      };

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Create new wallet</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text>
          Enter the list owners of multisig wallet and number of owners required to confirm transactions and then click
          button <b>Deploy Now</b>.
          {owners.map((owner, index) => (
            <FormControl display="flex" gap={2} mt={5} key={index}>
              <Input
                type="text"
                value={owner}
                placeholder="Owner address"
                onChange={(e) => {
                  const newOwners = [...owners];
                  newOwners[index] = e.target.value;
                  setOwners(newOwners);
                }}
              />
              <Button
                onClick={() => {
                  const newOwners = [...owners];
                  newOwners.push("");
                  setOwners(newOwners);
                }}
              >
                +
              </Button>
              {owners.length > 1 && (
                <Button
                  onClick={() => {
                    const newOwners = [...owners];
                    newOwners.splice(index, 1);
                    setOwners(newOwners);
                  }}
                >
                  -
                </Button>
              )}
            </FormControl>
          ))}
          <FormControl mt={5}>
            <FormLabel>Number of signatures required</FormLabel>
            <Input
              type="number"
              value={noOfSignaturesRequired}
              onChange={(e) =>
                setNoOfSignaturesRequired(parseInt(e.target.value))
              }
            />
          </FormControl>
        </Text>
      </ModalBody>
      <ModalFooter gap={2}>
        <Button onClick={closeModal} isDisabled={isDeploying}>
          Close
        </Button>
        <Button
          onClick={deployNow}
          isDisabled={isDeploying}
          colorScheme="twitter"
        >
          Deploy Now
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
  )
}

export default CreateWalletModal