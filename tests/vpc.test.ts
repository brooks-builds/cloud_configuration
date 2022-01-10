import * as pulumi from "@pulumi/pulumi";
import { MockCallArgs, MockResourceArgs } from "@pulumi/pulumi/runtime";
import { convertPulumiOutputs } from "bb-pulumi-helpers-ts/utilities";
import createdCloud from "../index";

pulumi.runtime.setMocks({
    newResource(args: MockResourceArgs): {id: string, state: any} {
        return {
            id: `${args.name}_id`,
            state: {...args.inputs}
        }
    },
    call(args: MockCallArgs): any {
        switch (args.token) {
            default:
                console.log("Not handling call for ", args.token);
                return {...args.inputs}
        }
    }
}, "Brooks Builds Testing", "Testing");

describe("Brooks Builds Cloud Configuration", () => {
    let vpcCidr: string;

    beforeAll(async () => {
        const {vpc} = await createdCloud();

        [vpcCidr] = await convertPulumiOutputs([vpc.cidrBlock]);
    })
    test("main vpc has the correct cidr block", async () => {
        expect(vpcCidr).toBe("10.0.0.0/16");
    })
})

export const name = "testing"