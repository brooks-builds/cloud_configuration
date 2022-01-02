import { getRegion, getAvailabilityZones } from "@pulumi/aws";
import { Route } from "@pulumi/aws/apigatewayv2";
import { RouteTable, Subnet, Vpc, VpcIpamScope } from "@pulumi/aws/ec2";
import { getProject, getStack } from "@pulumi/pulumi";

export async function createVpc(): Promise<Vpc> {
  const project = getProject();
  const region = await getRegion();
  const stack = getStack();
  const cidrBlock = "10.0.0.0/16";
  const enableDnsHostnames = true;
  const tags = {
    Name: stack,
  };

  return new Vpc(`${project} - ${stack} - ${region.name}`, {
    cidrBlock,
    enableDnsHostnames,
    tags,
  });
}

export async function createSubnet(
  name: string,
  vpc: Vpc,
  cidrBlock: string,
  mapPublicIpOnLaunch: boolean
): Promise<Subnet> {
  const pulumiName = `${name} - ${getProject()}:${getStack()}:${
    (await getRegion()).name
  }`;
  const availabilityZones = await getAvailabilityZones();
  return new Subnet(pulumiName, {
    cidrBlock,
    vpcId: vpc.id,
    availabilityZone: availabilityZones.names[0],
    mapPublicIpOnLaunch,
    tags: { Name: name },
  });
}

export async function createRouteTable(
  name: string,
  vpc: Vpc
): Promise<RouteTable> {
  const project = getProject();
  const stack = getStack();
  const region = await getRegion();
  const pulumiName = `${name} - ${project}:${stack}:${region.name}`;
  return new RouteTable(pulumiName, {
    vpcId: vpc.id,
  });
}
