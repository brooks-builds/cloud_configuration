import { Vpc } from "@pulumi/aws/ec2";
import pulumiHelpers from "bb-pulumi-helpers-ts";

const {aws} = pulumiHelpers;
const {createVpc} = aws;

export interface ICloudConfiguration {
  vpc: Vpc
}

async function main(): Promise<ICloudConfiguration> {
  const vpc = await createVpc();

  return {
    vpc
  }
}

export default main;