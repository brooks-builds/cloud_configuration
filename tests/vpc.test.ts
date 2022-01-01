/* eslint-disable @typescript-eslint/no-explicit-any */
import * as pulumi from "@pulumi/pulumi";
import {describe, test, expect} from "@jest/globals"
import {getPulumiOutputs} from "bb_pulumi_helpers";
import {createVpc} from "../index";
import { MockMonitor, MockResourceArgs } from "@pulumi/pulumi/runtime/mocks";

const project = "Brooks Builds"
const stack = "test"
const region = "us-east-1";

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
pulumi.runtime.setMockOptions(mockMonitor, project, stack, true);

describe("AWS Cloud setup", function () {
    describe("vpc", function () {
        test("must have a pulumi name that includes the region", async () => {
            const vpc = await createVpc();
            const [urn] = await getPulumiOutputs([vpc.urn]);
            expect(urn).toContain(`${project} - ${stack} - ${region}`);
        });
    });
});