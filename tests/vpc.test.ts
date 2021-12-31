import * as pulumi from "@pulumi/pulumi";

JS_EXT_TO_TREAT_AS_ESM.

pulumi.runtime.setMocks({
    newResource: function (args: pulumi.runtime.MockResourceArgs): { id: string, state: any } {
        return {
            id: args.inputs.name + "_id",
            state: {
                ...args.inputs,
            },
        };
    },
    call: function (args: pulumi.runtime.MockCallArgs) {
        return args;
    },
});

describe("AWS VPC", function () {
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