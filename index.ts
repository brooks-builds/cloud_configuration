import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import pulumiHelpers from "bb-pulumi-helpers-ts";
import { createInternetGateway, createMainRouteTableAssociation, createRouteTable, createRouteTableAssociation, createSubnet, createVpc } from "bb-pulumi-helpers-ts/aws";
import { MainRouteTableAssociation } from "@pulumi/aws/ec2";

const cidrBlocks = {
  vpc: "10.0.0.0/16",
  subnets: {
    public: "10.0.1.0/24",
    private: "10.0.2.0/24"
  }
};

const availabilityZone = "a"

async function main(): Promise<void> {
  const vpc = await createVpc(cidrBlocks.vpc);
  const internetGateway = await createInternetGateway(vpc);
  const publicSubnet = await createSubnet(cidrBlocks.subnets.public, vpc, availabilityZone, true);
  const privateSubnet = await createSubnet(cidrBlocks.subnets.private, vpc, availabilityZone);
  const routeTable = await createRouteTable(vpc, internetGateway);
  await createRouteTableAssociation(routeTable, publicSubnet);
  await createMainRouteTableAssociation(routeTable, vpc);
}

main();