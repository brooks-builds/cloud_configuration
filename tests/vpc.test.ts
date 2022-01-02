/* eslint-disable @typescript-eslint/no-explicit-any */
import * as pulumi from "@pulumi/pulumi";
import { describe, test, expect } from "@jest/globals";
import { getPulumiOutputs } from "bb-pulumihelpers";
import { MockMonitor, MockResourceArgs } from "@pulumi/pulumi/runtime/mocks";
import { createVpc, createSubnet, createRouteTable } from "../index";
import { RouteTable, Subnet } from "@pulumi/aws/ec2";
import * as faker from "faker";

const project = "Brooks Builds";
const stack = "test";
const region = "us-east-1";
const timeOutInSeconds = 22;
const vpcId = faker.datatype.uuid();
const availabilityZones = ["a", "b", "c"];

jest.setTimeout(timeOutInSeconds * 1000);

const mockMonitor = new MockMonitor({
  call(args: pulumi.runtime.MockCallArgs): Record<string, any> {
    switch (args.token) {
      case "aws:index/getRegion:getRegion":
        return { name: region };
      case "aws:index/getAvailabilityZones:getAvailabilityZones":
        return { names: availabilityZones };
      default:
        console.log("unknown call", args);
        return args;
    }
  },

  newResource(args: MockResourceArgs): { id: string; state: any } {
    switch (args.type) {
      case "aws:ec2/vpc:Vpc":
        return {
          id: vpcId,
          state: {
            ...args,
          },
        };
      default: {
        return {
          id: args.inputs.name + "_id",
          state: {
            ...args.inputs,
          },
        };
      }
    }
  },
});
pulumi.runtime.setMockOptions(mockMonitor, project, stack, false);

describe("AWS Cloud setup", function () {
  describe("vpc", () => {
    test("urn must have a good name", async () => {
      const vpc = await createVpc();
      const [urn] = await getPulumiOutputs([vpc.urn]);
      expect(urn).toContain(`${project} - ${stack} - ${region}`);
    });

    test("cidr block must be set", async () => {
      const vpc = await createVpc();
      const [cidrBlock] = await getPulumiOutputs([vpc.cidrBlock]);
      expect(cidrBlock).toBe("10.0.0.0/16");
    });

    test("enableDnsHostnames must be set", async () => {
      const vpc = await createVpc();
      const [enableDnsHostnames] = await getPulumiOutputs([
        vpc.enableDnsHostnames,
      ]);
      expect(enableDnsHostnames).toBe(true);
    });

    test("vpc must have a name tag", async () => {
      const vpc = await createVpc();
      const [tags] = await getPulumiOutputs([vpc.tags]);
      expect(tags).toHaveProperty("Name");
      expect(tags.Name).toBe(stack);
    });
  });

  describe("public subnet", () => {
    let subnet: null | Subnet;
    let urn: string;
    let cidrBlock: string;
    let vpcId: string;
    let availabilityZone: string;
    let mapPublicIpOnLaunch: boolean;
    let tags: { [key: string]: string };
    const name = "public subnet";

    beforeAll(async () => {
      const vpc = await createVpc();
      subnet = await createSubnet(name, vpc, "10.0.1.0/24", true);
      [urn, cidrBlock, vpcId, availabilityZone, mapPublicIpOnLaunch, tags] =
        await getPulumiOutputs([
          subnet.urn,
          subnet.cidrBlock,
          subnet.vpcId,
          subnet.availabilityZone,
          subnet.mapPublicIpOnLaunch,
          subnet.tags,
        ]);
    });

    test("has a good urn", () => {
      expect(urn).toContain(`${name} - ${project}:${stack}:${region}`);
    });

    test("has the appropriate cidr block", () => {
      expect(cidrBlock).toBe("10.0.1.0/24");
    });

    test("is associated with the vpc", () => {
      expect(vpcId).toBe(vpcId);
    });

    test("is in the first availability zone", () => {
      expect(availabilityZone).toBe(availabilityZones[0]);
    });

    test("public ips should be assigned to the subnet resources on launch", () => {
      expect(mapPublicIpOnLaunch).toBe(true);
    });

    test("should have name tag set", () => {
      expect(tags).toHaveProperty("Name");
      expect(tags.Name).toBe(name);
    });
  });

  describe("private subnet", () => {
    let subnet: Subnet | null = null;
    let mapPublicIpOnLaunch: boolean | null;

    beforeAll(async () => {
      const vpc = await createVpc();
      const cidrBlock = "10.0.2.0/24";
      subnet = await createSubnet("private subnet", vpc, cidrBlock, false);
      [mapPublicIpOnLaunch] = await getPulumiOutputs([
        subnet.mapPublicIpOnLaunch,
      ]);
    });

    test("the subnet should be private", () => {
      expect(mapPublicIpOnLaunch).toBe(false);
    });
  });

  describe("route table", () => {
    let routeTable: RouteTable | null;
    let urn = "";
    const name = "route table";

    beforeAll(async () => {
      const vpc = await createVpc();
      routeTable = await createRouteTable(name, vpc);
      [urn] = await getPulumiOutputs([routeTable.urn]);
    });

    test("the urn should make sense", () => {
      expect(urn).toContain(`${name} - ${project}:${stack}:${region}`);
    });
  });
});
