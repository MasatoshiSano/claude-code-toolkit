import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface AppStackProps extends cdk.StackProps {
  environmentName: string;
  vpcCidr: string;
  instanceType: string;
  desiredCount: number;
  databaseConfig: {
    instanceClass: string;
    allocatedStorage: number;
    multiAZ: boolean;
  };
}

export class AppStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly cluster: ecs.Cluster;
  public readonly service: ecs.FargateService;
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;
  public readonly database: rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    // VPC
    this.vpc = new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr(props.vpcCidr),
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'Database',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    // Database Secret
    const dbSecret = new secretsmanager.Secret(this, 'DBSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'admin' }),
        generateStringKey: 'password',
        excludePunctuation: true,
      },
    });

    // RDS Database
    this.database = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14,
      }),
      instanceType: new ec2.InstanceType(props.databaseConfig.instanceClass),
      allocatedStorage: props.databaseConfig.allocatedStorage,
      multiAz: props.databaseConfig.multiAZ,
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      credentials: rds.Credentials.fromSecret(dbSecret),
      deletionProtection: props.environmentName === 'production',
      backupRetention: props.environmentName === 'production'
        ? cdk.Duration.days(7)
        : cdk.Duration.days(1),
    });

    // ECS Cluster
    this.cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: this.vpc,
      containerInsights: true,
    });

    // Application Load Balancer
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc: this.vpc,
      internetFacing: true,
    });

    // Fargate Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    const container = taskDefinition.addContainer('AppContainer', {
      image: ecs.ContainerImage.fromRegistry('nginx'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: props.environmentName,
      }),
      environment: {
        ENVIRONMENT: props.environmentName,
      },
      secrets: {
        DB_PASSWORD: ecs.Secret.fromSecretsManager(dbSecret, 'password'),
      },
    });

    container.addPortMappings({
      containerPort: 80,
    });

    // Fargate Service
    this.service = new ecs.FargateService(this, 'Service', {
      cluster: this.cluster,
      taskDefinition,
      desiredCount: props.desiredCount,
      healthCheckGracePeriod: cdk.Duration.seconds(60),
    });

    // Allow service to access database
    this.database.connections.allowFrom(this.service, ec2.Port.tcp(5432));

    // Target Group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      vpc: this.vpc,
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [this.service],
      healthCheck: {
        path: '/health',
        interval: cdk.Duration.seconds(30),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
    });

    // Listener
    this.loadBalancer.addListener('Listener', {
      port: 80,
      defaultTargetGroups: [targetGroup],
    });

    // Outputs
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: this.loadBalancer.loadBalancerDnsName,
      description: 'Load Balancer DNS Name',
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.dbInstanceEndpointAddress,
      description: 'Database Endpoint',
    });

    // Tags
    cdk.Tags.of(this).add('Environment', props.environmentName);
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}
