const { Amplify } = require('aws-amplify');
const { generateClient } = require('aws-amplify/api');

// Configure Amplify for Lambda environment
Amplify.configure({
  API: {
    GraphQL: {
      endpoint: process.env.APPSYNC_API_URL,
      region: process.env.AWS_REGION,
      defaultAuthMode: 'apiKey',
      apiKey: process.env.APPSYNC_API_KEY
    }
  }
});

const client = generateClient();

const createHandState = /* GraphQL */ `
  mutation CreateHandState($input: CreateHandStateInput!) {
    createHandState(input: $input) {
      id
      deviceName
      gesture
      letter
      indexAngle1
      indexAngle2
      middleAngle1
      middleAngle2
      ringAngle1
      ringAngle2
      thumbAngle1
      thumbAngle2
      timestamp
      createdAt
    }
  }
`;

exports.handler = async (event) => {
  try {
    console.log('Received IoT event:', JSON.stringify(event, null, 2));
    console.log('Environment variables:', {
      APPSYNC_API_URL: process.env.APPSYNC_API_URL,
      APPSYNC_API_ID: process.env.APPSYNC_API_ID,
      AWS_REGION: process.env.AWS_REGION
    });

    if (!event.device_name) {
      throw new Error('Missing device_name in event');
    }

    // Extract finger angles from nested structure, with defaults
    const fingers = event.fingers || {};
    const index = fingers.index || {};
    const middle = fingers.middle || {};
    const ring = fingers.ring || {};
    const thumb = fingers.thumb || {};

    console.log('Parsed fingers:', JSON.stringify({ index, middle, ring, thumb }, null, 2));

    const handStateData = {
      deviceName: event.device_name,
      gesture: event.gesture || null,
      letter: event.letter || null,
      indexAngle1: index.angle_1 !== undefined ? index.angle_1 : 0,
      indexAngle2: index.angle_2 !== undefined ? index.angle_2 : 0,
      middleAngle1: middle.angle_1 !== undefined ? middle.angle_1 : 0,
      middleAngle2: middle.angle_2 !== undefined ? middle.angle_2 : 0,
      ringAngle1: ring.angle_1 !== undefined ? ring.angle_1 : 0,
      ringAngle2: ring.angle_2 !== undefined ? ring.angle_2 : 0,
      thumbAngle1: thumb.angle_1 !== undefined ? thumb.angle_1 : 0,
      thumbAngle2: thumb.angle_2 !== undefined ? thumb.angle_2 : 0,
      timestamp: event.ts || Math.floor(Date.now() / 1000)
    };

    console.log('Sending to AppSync:', JSON.stringify(handStateData, null, 2));

    const result = await client.graphql({
      query: createHandState,
      variables: { input: handStateData }
    });

    console.log('GraphQL mutation result:', JSON.stringify(result, null, 2));
    return { statusCode: 200, body: 'Hand state processed successfully' };
  } catch (error) {
    console.error('Error processing hand state:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return { statusCode: 500, body: 'Error processing hand state' };
  }
};
