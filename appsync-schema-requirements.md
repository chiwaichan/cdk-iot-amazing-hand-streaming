# AppSync Schema Requirements for Amazing Hand IoT Streaming

## Context

The `IoTAmazingHandStreamingStack` CDK stack streams robotic hand state data from AWS IoT Core to AppSync via a Lambda function. The Lambda is already deployed and invoked successfully, but the AppSync schema is missing the required type, input, and mutation.

## Current Errors

```
Validation error of type UnknownType: Unknown type CreateAmazingHandInput
Validation error of type FieldUndefined: Field 'createAmazingHand' in type 'Mutation' is undefined @ 'createAmazingHand'
```

## Required Schema Additions

### 1. AmazingHand Type

```graphql
type AmazingHand @model {
  id: ID!
  deviceName: String!
  hand: String!
  thumb: Int!
  indexFinger: Int!
  middleFinger: Int!
  ringPinky: Int!
  timestamp: AWSTimestamp!
  createdAt: AWSDateTime
}
```

### 2. CreateAmazingHandInput

```graphql
input CreateAmazingHandInput {
  deviceName: String!
  hand: String!
  thumb: Int!
  indexFinger: Int!
  middleFinger: Int!
  ringPinky: Int!
  timestamp: AWSTimestamp!
}
```

### 3. Mutation

```graphql
type Mutation {
  createAmazingHand(input: CreateAmazingHandInput!): AmazingHand
}
```

## Field Mapping Reference

The Lambda maps IoT payload fields to AppSync input fields as follows:

| IoT Payload Field | AppSync Input Field | Type | Default |
|---|---|---|---|
| `device_name` (from MQTT topic) | `deviceName` | String | (required) |
| `hand` | `hand` | String | `"right"` |
| `thumb` | `thumb` | Int | `0` |
| `index_finger` | `indexFinger` | Int | `0` |
| `middle_finger` | `middleFinger` | Int | `0` |
| `ring_pinky` | `ringPinky` | Int | `0` |
| `timestamp` | `timestamp` | AWSTimestamp | `Date.now()` |

## Sample IoT Payload

Published to MQTT topic `the-project/robotic-hand/XIAOAmazingHandRight/state`:

```json
{
  "gesture": "fingerspell",
  "fingers": {
    "index": { "angle_1": 45, "angle_2": -45 },
    "middle": { "angle_1": 45, "angle_2": -45 },
    "ring": { "angle_1": 45, "angle_2": -45 },
    "thumb": { "angle_1": 60, "angle_2": -60 }
  },
  "ts": 1770550850,
  "letter": "E"
}
```

The `device_name` field (`XIAOAmazingHandRight`) is extracted from position 3 of the MQTT topic by the IoT rule SQL:

```sql
SELECT *, topic(3) AS device_name FROM 'the-project/robotic-hand/+/state'
```

## AppSync API Details

- **API ID**: `kt76hwkqsnhyhc33j3u4vzskfm`
- **Endpoint**: `https://kt76hwkqsnhyhc33j3u4vzskfm.appsync-api.us-east-1.amazonaws.com/graphql`
- **Auth Mode**: API Key
