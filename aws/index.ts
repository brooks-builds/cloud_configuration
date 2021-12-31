import * as aws from "@pulumi/aws";

export const vpc = new aws.ec2.Vpc("meow", {
    cidrBlock: "10.0.0.0/16",
    tags: {
        Name: "arsietarist"
    }
})