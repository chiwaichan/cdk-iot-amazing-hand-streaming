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

const createAmazingHand = /* GraphQL */ `
  mutation CreateAmazingHand($input: CreateAmazingHandInput!) {
    createAmazingHand(input: $input) {
      id
      deviceName
      hand
      thumb
      indexFinger
      middleFinger
      ringPinky
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

    const amazingHandData = {
      deviceName: event.device_name,
      hand: event.hand || 'right',
      thumb: event.thumb || 0,
      indexFinger: event.index_finger || 0,
      middleFinger: event.middle_finger || 0,
      ringPinky: event.ring_pinky || 0,
      timestamp: Math.floor(event.timestamp / 1000) || Math.floor(Date.now() / 1000)
    };

    console.log('Sending to AppSync:', JSON.stringify(amazingHandData, null, 2));

    const result = await client.graphql({
      query: createAmazingHand,
      variables: { input: amazingHandData }
    });

    console.log('GraphQL mutation result:', JSON.stringify(result, null, 2));
    return { statusCode: 200, body: 'Amazing hand state processed successfully' };
  } catch (error) {
    console.error('Error processing amazing hand state:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return { statusCode: 500, body: 'Error processing amazing hand state' };
  }
};
