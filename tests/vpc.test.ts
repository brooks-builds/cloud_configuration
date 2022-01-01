/* eslint-disable @typescript-eslint/no-explicit-any */
import * as pulumi from "@pulumi/pulumi";
import { describe, test, expect } from "@jest/globals";
import { getPulumiOutputs } from "bb-pulumihelpers";
import { MockMonitor, MockResourceArgs } from "@pulumi/pulumi/runtime/mocks";
import { createVpc, createSubnet } from "../index";
import { Subnet } from "@pulumi/aws/ec2";

const project = "Brooks Builds";
const stack = "test";
const region = "us-east-1";
const timeOutInSeconds = 22;

jest.setTimeout(timeOutInSeconds * 1000);

const mockMonitor = new MockMonitor({
  call(args: pulumi.runtime.MockCallArgs): Record<string, any> {
    switch (args.token) {
    case "aws:index/getRegion:getRegion":
      return { name: region };
    default:
      console.log("unknown call", args);
      return args;
    }
  },

  newResource(args: MockResourceArgs): { id: string, state: any } {
    switch (args.type) {
    case "aws:ec2/vpc:Vpc":
      return {
        id: "5",
        state: {
          ...args
        }
      };
    default: {
      console.log("new resource", args);
      return {
        id: args.inputs.name + "_id",
        state: {
          ...args.inputs,
        }
      };
    }
    }
  }
});
pulumi.runtime.setMockOptions(mockMonitor, project, stack, false);

describe("AWS Cloud setup", function () {
  describe("vpc", () => {
    test("urn must have a good name", async () => {
      const vpc = await createVpc();
      const [
        urn,
      ] = await getPulumiOutputs([
        vpc.urn,
      ]);
      expect(urn).toContain(`${project} - ${stack} - ${region}`);
    });

    test("cidr block must be set", async () => {
      const vpc = await createVpc();
      const [
        cidrBlock,
      ] = await getPulumiOutputs([
        vpc.cidrBlock,
      ]);
      expect(cidrBlock).toBe("10.0.0.0/16");
    });

    test("enableDnsHostnames must be set", async () => {
      const vpc = await createVpc();
      const [
        enableDnsHostnames,
      ] = await getPulumiOutputs([
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

    beforeAll(async () => {
      const vpc = await createVpc();
      subnet = await createSubnet("public subnet", vpc, "10.0.1.0/24");
      [urn] = await getPulumiOutputs([subnet.urn]);
    });

    test("has a good urn", async () => {
      expect(urn).toContain(`public subnet - ${project}:${stack}:${region}`);
    });
  });
});