import { getRegion } from "@pulumi/aws";
import { Subnet, Vpc } from "@pulumi/aws/ec2";
import { getProject, getStack } from "@pulumi/pulumi";

export async function createVpc(): Promise<Vpc> {
  const project = getProject();
  const region = await getRegion();
  const stack = getStack();
  const cidrBlock = "10.0.0.0/16";
  const enableDnsHostnames = true;
  const tags = {
    Name: stack
  };

  return new Vpc(`${project} - ${stack} - ${region.name}`, {
    cidrBlock,
    enableDnsHostnames,
    tags
  });
}

export async function createSubnet(name: string, vpc: Vpc, cidrBlock: string): Promise<Subnet> {
  name = `${name} - ${getProject()}:${getStack()}:${(await getRegion()).name}`;
  return new Subnet(name, {cidrBlock, vpcId: vpc.id});
}