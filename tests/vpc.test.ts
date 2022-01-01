/* eslint-disable @typescript-eslint/no-explicit-any */
import * as pulumi from "@pulumi/pulumi";
import {describe, test, expect} from "@jest/globals"
import {getPulumiOutputs} from "bb-pulumihelpers";
import {createVpc} from "../index";
import { MockMonitor, MockResourceArgs } from "@pulumi/pulumi/runtime/mocks";

const project = "Brooks Builds"
const stack = "test"
const region = "us-east-1";
const timeOutInSeconds = 22;

jest.setTimeout(timeOutInSeconds * 1000);

const mockMonitor = new MockMonitor({
    call(args: pulumi.runtime.MockCallArgs): Record<string, any> {
        switch (args.token) {
            case "aws:index/getRegion:getRegion":
                return {name: region};
            default:
                console.log("unknown call", args);
                return args
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
                }
                default: {
                    console.log("new resource", args);
                    return {
                        id: args.inputs.name + "_id",
                        state: {
                            ...args.inputs,
                        }
                    }
                }
        }
    }
})
pulumi.runtime.setMockOptions(mockMonitor, project, stack, false);

describe("AWS Cloud setup", function () {
        test("vpc must be configured correctly", async () => {
            const vpc = await createVpc();
            const [
                urn,
                cidrBlock,
                enableDnsHostnames,
                tags
            ] = await getPulumiOutputs([
                vpc.urn,
                vpc.cidrBlock,
                vpc.enableDnsHostnames,
                vpc.tags
            ]);
            console.log(urn);
            console.log(`${project} - ${stack} - ${region}`);
            expect(urn).toContain(`${project} - ${stack} - ${region}`);
            expect(cidrBlock).toBe("10.0.0.0/16");
            expect(enableDnsHostnames).toBe(true);
            expect(tags).toHaveProperty("Name");
            expect(tags.Name).toBe(stack);
        });
});