import * as cdk from 'aws-cdk-lib';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { Trail } from 'aws-cdk-lib/aws-cloudtrail';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class MyCloudtrailStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const trailBucket = new Bucket(this, 'TrailBucket', {
      bucketName: 'trailbucket-iaac-121',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    trailBucket.addToResourcePolicy(
      new PolicyStatement({
        sid: 'AWSCloudTrailAclCheck',
        effect: Effect.ALLOW,
        principals: [
          new cdk.aws_iam.ServicePrincipal('cloudtrail.amazonaws.com'),
        ],
        actions: ['s3:GetBucketAcl'],
        resources: [trailBucket.bucketArn],
      })
    );

    trailBucket.addToResourcePolicy(
      new PolicyStatement({
        sid: 'AWSCloudTrailWrite',
        effect: Effect.ALLOW,
        principals: [
          new cdk.aws_iam.ServicePrincipal('cloudtrail.amazonaws.com'),
        ],
        actions: ['s3:PutObject'],
        resources: [`${trailBucket.bucketArn}/AWSLogs/*`],
        conditions: {
          'StringEquals': {
            's3:x-amz-acl': 'bucket-owner-full-control',
          },
        },
      })
    );

    const logGroup = LogGroup.fromLogGroupName(
      this,
      'ExistingLogGroup',
      'aws-cloudtrail-logs-255757669830-7081c037'
    );

    new Trail(this, 'MyCloudTrail', {
      bucket: trailBucket,
      cloudWatchLogGroup: logGroup,
    });
  }
}
