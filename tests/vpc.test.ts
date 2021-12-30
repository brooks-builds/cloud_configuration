// Copyright 2016-2020, Pulumi Corporation.  All rights reserved.

import * as pulumi from "@pulumi/pulumi";
import { URN } from "@pulumi/pulumi";
import "mocha";

jest.setTimeout(5000);

pulumi.runtime.setMocks({
    newResource: function (args: pulumi.runtime.MockResourceArgs): { id: string, state: any } {
        switch (args.type) {
            case "aws:ec2/vpc:Vpc":
                return {
                    id: "sg-12345678",
                    state: {
                        ...args.inputs,

                        arn: "arn:aws:ec2:us-west-2:123456789012:security-group/sg-12345678",
                        name: args.inputs.name || args.name + "-sg",
                    },
                };
            default:
                return {
                    id: args.inputs.name + "_id",
                    state: {
                        ...args.inputs,
                    },
                };
        }
    },
    call: function (args: pulumi.runtime.MockCallArgs) {
        switch (args.token) {
            case "aws:ec2/getAmi:getAmi":
                return {
                    "architecture": "x86_64",
                    "id": "ami-0eb1f3cdeeb8eed2a",
                };
            default:
                return args;
        }
    },
});

describe("Infrastructure", function () {
    let infra: typeof import("../index");

    beforeAll(async function () {
        // It's important to import the program _after_ the mocks are defined.
        infra = await import("../index");
    });

    describe("#server", function () {
        // check 1: Instances have a Name tag.
        it("must have a name tag", function (done) {
            pulumi.all([infra.vpc.id]).apply(([id]) => {
                done(expect(id).toBe("sg-12345678"))
            });
        });
    });
});