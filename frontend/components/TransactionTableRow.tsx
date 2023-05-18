import { Button, Skeleton, Td, Tr, useToast } from "@chakra-ui/react";
import {
  toEther,
  useAddress,
  useContract,
  useContractEvents,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react";
import React from "react";

type Props = {
    id: number;
    contractAddress: string;
  };

const TransactionTableRow = ({ id, contractAddress }: Props) => {

  const toast = useToast();
  
  const { contract } = useContract(contractAddress, "custom");
  const { data, refetch } = useContractRead(contract, "getTransaction", [id]);
  const { mutateAsync: sign, isLoading: isSigning } = useContractWrite(
    contract,
    "signTransaction"
  );
  const address = useAddress();//get address metamask wallet
  
  //return array [] if owner not sign this transaction filter by transactionID and address owner
  const { data: signatures} = useContractEvents(
    contract,
    "TransactionSigned",
    {
      queryFilter: {
        filters: {
          transactionId: id,
          signer: address,
        },
        order: "asc",
      },
      subscribe: true,
    }
  );


    //handle sign confirm a transaction
    const signTxn = async () => {
        try {
          await sign({
            args: [id],
          });
          toast({
            status: "success",
            title: "Signed transaction",
            description: "You have signed this transaction",
          });
          refetch();
        } catch (err) {
          toast({
            status: "error",
            title: "Failed to sign transaction",
            // @ts-ignore
            description: err.reason,
          });
          console.error(err);
          await refetch();
        }
      };

  return (
    <Tr>
    <Td>{id?.toString()}</Td>
    <Td>{data?.[0] || <Skeleton>0x1234567890</Skeleton>}</Td>
    <Td>{data?.[1] ? toEther(data?.[1]) : <Skeleton>10.0</Skeleton>}</Td>
    <Td>{data?.[2] || <Skeleton>0x1234567890</Skeleton>}</Td>
    <Td>{data?.[4].toString() || <Skeleton>10</Skeleton>}</Td>
    <Td>
      {data?.[3] === undefined ? (
        <Skeleton>Waiting</Skeleton>
      ) : data?.[3] === true ? (
        "Executed"
      ) : (
        "Awaiting signatures"
      )}
    </Td>
    <Td>
      {data?.[3] === undefined ? (
        <Skeleton>Loading...</Skeleton>
      ) : data?.[3] === true ? (
        "N/A"
      ) : signatures?.length == 0 ? (
        <Button isDisabled={isSigning} onClick={signTxn} colorScheme="twitter">Sign</Button>
      ) : (
        "Signed"
      )}
    </Td>
  </Tr>
  )
}

export default TransactionTableRow