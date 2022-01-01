import { getRegion } from "@pulumi/aws";
import { Vpc } from "@pulumi/aws/ec2";
import { getProject, getStack } from "@pulumi/pulumi";

export async function createVpc(): Promise<Vpc> {
    const project = getProject();
    const region = await getRegion();
    const stack = getStack();
    return new Vpc(`${project} - ${stack} - ${region.name}`);
}