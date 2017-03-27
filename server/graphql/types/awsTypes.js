// awsTypes.js

const AvailabilityZone = `
    type AvailabilityZone {
        ZoneName: String
        State: String
        RegionName: String
    }
`

const HostedZone = `
    type HostedZone {
        Id: String
        Name: String
        CallerReference: String
        ResourceRecordSetCount: Int
    }
`

const Instance = `
    type Instance {
        InstanceId: String
        Tags: [ParamTag]
    }
`

const KeyPair = `
    type KeyPair {
        KeyName: String
        KeyFingerprint: String
    }
`

const Image = `
    type Image {
        ImageId: String
    }
`

const SecurityGroup = `
    type SecurityGroup {
        OwnerId: String
        GroupName: String
        GroupId: String
        Description: String
        VpcId: String
        Tags: [ParamTag]
    }
`

const Subnet = `
    type Subnet {
        SubnetId: String
        State: String
        VpcId: String
        CidrBlock: String
        AssignIpv6AddressOnCreation: Boolean
        AvailableIpAddressCount: Int
        AvailabilityZone: String
        DefaultForAz: Boolean
        MapPublicIpOnLaunch: Boolean
        Tags: [ParamTag]
    }
`

const ParamTag = `
    type ParamTag {
        Value: String
        Key: String
    }
`

const Volume = `
    type Volume {
        VolumeId: String
        Size: Int
        SnapshotId: String
        AvailabilityZone: String
        State: String
        VolumeType: String
        Encrypted: Boolean
    }
`

const VPC = `
    type VPC {
        _id: String
        VpcId: String
        InstanceTenancy: String
        Tags: [ParamTag]
        State: String
        DhcpOptionsId: String
        CidrBlock: String
        IsDefault: Boolean
    }
`

export default() => [AvailabilityZone, HostedZone, Image, Instance, KeyPair, ParamTag, SecurityGroup, Subnet, Volume, VPC]
